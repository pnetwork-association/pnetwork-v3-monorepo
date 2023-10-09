const R = require('ramda')
const ethers = require('ethers')
const errors = require('../errors')
const abi = require('./abi/PNetworkHub').abi
const constants = require('ptokens-constants')
const { logger } = require('../get-logger')
const { HubError } = require('./evm-hub-error')
const { utils, logic } = require('ptokens-utils')
const { checkEventName } = require('../check-event-name')
const { addErrorToReport } = require('../add-error-to-event')
const { STATE_PROPOSED_DB_REPORTS } = require('../state/constants')
const { addFinalizedEventsToState } = require('../state/state-operations.js')
const { parseUserOperationFromReport } = require('./evm-parse-user-operation')
const {
  checkEventsHaveExpectedDestinationChainId,
} = require('../check-events-have-expected-chain-id')

const addFinalizedTxHashToEvent = R.curry((_event, _finalizedTxHash) => {
  const id = _event[constants.db.KEY_ID]
  logger.debug(`Adding ${_finalizedTxHash} to ${id.slice(0, 20)}...`)
  const finalizedTimestamp = new Date().toISOString()
  delete _event[constants.db.KEY_ERROR]
  const updatedEvent = {
    ..._event,
    [constants.db.KEY_FINAL_TX_TS]: finalizedTimestamp,
    [constants.db.KEY_FINAL_TX_HASH]: _finalizedTxHash,
    [constants.db.KEY_STATUS]: constants.db.txStatus.FINALIZED,
  }
  return Promise.resolve(updatedEvent)
})

const estimateGasErrorHandler = (_resolve, _reject, _report, _err) => {
  if (_err.message.includes(errors.ERROR_OPERATION_ALREADY_EXECUTED)) {
    return _resolve(addFinalizedTxHashToEvent(_report, '0x'))
  } else if (
    _err.message.includes(errors.ERROR_LOCKDOWN_MODE) ||
    _err.message.includes(errors.ERROR_CHALLENGE_PERIOD_NOT_TERMINATED)
  ) {
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
  } else {
    logger.error(_err)
    return _resolve(addErrorToReport(_report, _err))
  }
}

const makeFinalContractCall = R.curry(
  (_wallet, _hub, _txTimeout, _report) =>
    new Promise((resolve, reject) => {
      const id = _report[constants.db.KEY_ID]
      const eventName = _report[constants.db.KEY_EVENT_NAME]
      const args = parseUserOperationFromReport(_report)
      const contract = new ethers.Contract(_hub, abi, _wallet)
      logger.info(`Executing _id: ${id}`)
      return checkEventName(eventName)
        .then(_ => contract.protocolExecuteOperation(...args))
        .then(_tx => logger.debug('protocolExecute called, awaiting...') || _tx.wait(1))
        .then(_receipt => logger.info('Tx mined successfully!') || _receipt)
        .then(R.prop(constants.evm.ethers.KEY_TX_HASH))
        .then(addFinalizedTxHashToEvent(_report))
        .then(resolve)
        .catch(_err => errorHandler(resolve, reject, contract, _report, _err))
    })
)

const sendFinalTransactions = R.curry(async (_eventReports, _hubAddress, _timeOut, _wallet) => {
  logger.info(`Sending final txs w/ address ${_wallet.address}`)
  const newReports = []
  for (const report of _eventReports) {
    const newReport = await makeFinalContractCall(_wallet, _hubAddress, _timeOut, report)
    // If null, means there was an handled error which we need to retry later
    if (utils.isNotNil(newReport)) newReports.push(newReport)
    await logic.sleepForXMilliseconds(1000) // TODO: make configurable
  }

  return newReports
})

// TODO: function very similar to the one for building proposals...factor out?
const buildFinalTxsAndPutInState = _state =>
  new Promise(resolve => {
    logger.info('Building final txs...')
    const proposedEvents = _state[STATE_PROPOSED_DB_REPORTS]
    const destinationNetworkId = _state[constants.state.KEY_NETWORK_ID]
    const providerUrl = _state[constants.state.KEY_PROVIDER_URL]
    const identityGpgFile = _state[constants.state.KEY_IDENTITY_FILE]
    const provider = new ethers.JsonRpcProvider(providerUrl)
    const txTimeout = _state[constants.state.KEY_TX_TIMEOUT]
    const hub = _state[constants.state.KEY_HUB_ADDRESS]
    const privateKey = utils.readIdentityFileSync(identityGpgFile)
    const wallet = new ethers.Wallet(privateKey, provider)

    return checkEventsHaveExpectedDestinationChainId(destinationNetworkId, proposedEvents)
      .then(_ => sendFinalTransactions(proposedEvents, hub, txTimeout, wallet))
      .then(addFinalizedEventsToState(_state))
      .then(resolve)
  })

const maybeBuildFinalTxsAndPutInState = _state =>
  new Promise(resolve => {
    logger.info('Maybe building final txs...')
    const proposedEvents = _state[STATE_PROPOSED_DB_REPORTS] || []
    const proposedEventsNumber = R.length(proposedEvents)

    return proposedEventsNumber === 0
      ? logger.info('No proposals found...') || resolve(_state)
      : logger.info(`Found ${proposedEventsNumber} proposals to process...`) ||
          buildFinalTxsAndPutInState(_state).then(resolve)
  })

module.exports = {
  makeFinalContractCall,
  maybeBuildFinalTxsAndPutInState,
}
