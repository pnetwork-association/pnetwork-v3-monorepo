const R = require('ramda')
const ethers = require('ethers')
const errors = require('../errors')
const abi = require('./abi/PNetworkHub').abi
const { logger } = require('../get-logger')
const constants = require('ptokens-constants')
const { HubError } = require('./evm-hub-error')
const { utils, logic } = require('ptokens-utils')
const { checkEventName } = require('../check-event-name')
const { STATE_DETECTED_DB_REPORTS } = require('../state/constants')
const { addErrorToReport } = require('../add-error-to-event')
const { addProposalsReportsToState } = require('../state/state-operations.js')
const { parseUserOperationFromReport } = require('./evm-parse-user-operation')
const {
  checkEventsHaveExpectedDestinationChainId,
} = require('../check-events-have-expected-chain-id')

// TODO: factor out (check evm-build-final-txs)
const addProposedTxHashToEvent = R.curry(
  (_event, _proposedTxHash) =>
    new Promise((resolve, _) => {
      const id = _event[constants.db.KEY_ID]
      logger.debug(`Adding ${_proposedTxHash} to ${id.slice(0, 20)}...`)
      const proposedTimestamp = new Date().toISOString()
      delete _event[constants.db.KEY_ERROR]
      const updatedEvent = {
        ..._event,
        [constants.db.KEY_PROPOSAL_TS]: proposedTimestamp,
        [constants.db.KEY_PROPOSAL_TX_HASH]: _proposedTxHash,
        [constants.db.KEY_STATUS]: constants.db.txStatus.PROPOSED,
      }
      return resolve(updatedEvent)
    })
)

const skipEvent = (_event, _err) =>
  new Promise(resolve => {
    const updatedEvent = {
      ..._event,
      [constants.db.KEY_PROPOSAL_TS]: new Date().toISOString(),
      [constants.db.KEY_PROPOSAL_TX_HASH]: '0x',
      [constants.db.KEY_STATUS]: constants.db.txStatus.SKIPPED,
      [constants.db.KEY_ERROR]: R.propOr(null, 'message', _err),
    }
    return resolve(updatedEvent)
  })

const estimateGasErrorHandler = (_resolve, _reject, _report, _err) => {
  if (_err.message.includes(errors.ERROR_OPERATION_ALREADY_QUEUED)) {
    return _resolve(addProposedTxHashToEvent(_report, '0x'))
  } else if (_err.message.includes(errors.ERROR_LOCKDOWN_MODE)) {
    logger.error(`'${_err.message}' detected, retrying shortly...`)
    return _resolve(null)
  } else {
    logger.error(_err)
    return _resolve(addErrorToReport(_report, _err))
  }
}

const errorHandler = (_resolve, _reject, _contract, _report, _err) => {
  if (_err.message.includes(constants.evm.ethers.ERROR_ESTIMATE_GAS)) {
    const hubError = new HubError(_contract, _err)
    return estimateGasErrorHandler(_resolve, _reject, _report, hubError)
  } else if (_err.message.includes(errors.ERROR_INSUFFICIENT_FUNDS)) {
    logger.error(`'${_err.info.error.message}' detected, retrying shortly...`)
    return _resolve(null)
  } else if (_err.message.includes(errors.ERROR_NETWORK_FEE_NOT_ACCEPTED)) {
    logger.warn(_err.message)
    return _resolve(skipEvent(_report, _err))
  } else {
    logger.error(_err)
    return _resolve(addErrorToReport(_report, _err))
  }
}

const checkNetworkFee = _networkFee =>
  _networkFee > 0
    ? Promise.resolve()
    : Promise.reject(new Error(`${errors.ERROR_NETWORK_FEE_NOT_ACCEPTED} (${_networkFee})`))

const makeProposalContractCall = R.curry(
  (_wallet, _hubAddress, _txTimeout, _amountToLock, _report) =>
    new Promise((resolve, reject) => {
      const id = _report[constants.db.KEY_ID]
      const eventName = _report[constants.db.KEY_EVENT_NAME]
      const args = parseUserOperationFromReport(_report)
      const contract = new ethers.Contract(_hubAddress, abi, _wallet)
      const networkFee = _report[constants.db.KEY_NETWORK_FEE_ASSET_AMOUNT]

      logger.info(`Queueing _id: ${id.slice(0, 30)}... w/ locked amount ${_amountToLock}`)
      return checkNetworkFee(networkFee)
        .then(_ => checkEventName(eventName))
        .then(_ => contract.protocolQueueOperation(...args, { value: _amountToLock }))
        .then(_tx => logger.debug('protocolQueue called, awaiting...') || _tx.wait())
        .then(_receipt => logger.info('Tx mined successfully!') || _receipt)
        .then(R.prop(constants.evm.ethers.KEY_TX_HASH))
        .then(addProposedTxHashToEvent(_report))
        .then(resolve)
        .catch(_err => errorHandler(resolve, reject, contract, _report, _err))
    })
)

const sendProposalTransactions = R.curry(
  async (_eventReports, _hubAddress, _timeOut, _wallet, _amountToLock) => {
    logger.info(`Sending proposals w/ address ${_wallet.address}`)
    // TODO: make configurable
    const updatedReports = []
    const sleepTime = 1000
    for (const report of _eventReports) {
      const newReport = await makeProposalContractCall(
        _wallet,
        _hubAddress,
        _timeOut,
        _amountToLock,
        report
      )
      if (utils.isNotNil(newReport)) updatedReports.push(newReport)

      await logic.sleepForXMilliseconds(sleepTime)
    }

    return updatedReports
  }
)

const getLockedAmountChallengePeriod = (_hubAddress, _provider) =>
  Promise.resolve(new ethers.Contract(_hubAddress, abi, _provider)).then(_contract =>
    _contract.lockedAmountChallengePeriod()
  )

const buildProposalsTxsAndPutInState = _state =>
  new Promise((resolve, reject) => {
    logger.info('Building proposals txs...')
    const detectedEvents = _state[STATE_DETECTED_DB_REPORTS]

    if (detectedEvents.length === 0)
      return logger.info('No new operations detected...') || resolve(_state)

    const destinationNetworkId = _state[constants.state.KEY_NETWORK_ID]
    const providerUrl = _state[constants.state.KEY_PROVIDER_URL]
    const identityGpgFile = _state[constants.state.KEY_IDENTITY_FILE]
    const hubAddress = _state[constants.state.KEY_HUB_ADDRESS]
    const txTimeout = _state[constants.state.KEY_TX_TIMEOUT]
    const provider = new ethers.JsonRpcProvider(providerUrl)
    const privateKey = utils.readIdentityFileSync(identityGpgFile)
    const wallet = new ethers.Wallet(privateKey, provider)

    return checkEventsHaveExpectedDestinationChainId(destinationNetworkId, detectedEvents)
      .then(_ => getLockedAmountChallengePeriod(hubAddress, provider))
      .then(sendProposalTransactions(detectedEvents, hubAddress, txTimeout, wallet))
      .then(addProposalsReportsToState(_state))
      .then(resolve)
      .then(reject)
  })

const maybeBuildProposalsTxsAndPutInState = _state =>
  new Promise(resolve => {
    logger.info('Maybe building proposals txs...')
    const detectedEvents = _state[STATE_DETECTED_DB_REPORTS]
    const detectedEventsNumber = R.length(detectedEvents)

    return detectedEventsNumber === 0
      ? logger.info('No detected events found...') || resolve(_state)
      : logger.info(`Detected ${detectedEventsNumber} events to process...`) ||
          resolve(buildProposalsTxsAndPutInState(_state))
  })

module.exports = {
  makeProposalContractCall,
  buildProposalsTxsAndPutInState,
  maybeBuildProposalsTxsAndPutInState,
}
