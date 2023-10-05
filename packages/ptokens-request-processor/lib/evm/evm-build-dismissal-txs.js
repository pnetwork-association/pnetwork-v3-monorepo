const R = require('ramda')
const ethers = require('ethers')
const errors = require('../errors')
const abi = require('./abi/PNetworkHub').abi
const constants = require('ptokens-constants')
const { logger } = require('../get-logger')
const { HubError } = require('./evm-hub-error')
const { getMerkleProof } = require('./get-merkle-proof')
const { checkEventName } = require('../check-event-name')
const { addErrorToReport } = require('../add-error-to-event')
const { constants: ptokensUtilsConstants, logic, utils } = require('ptokens-utils')
const { addDismissedReportsToState } = require('../state/state-operations.js')
const { STATE_TO_BE_DISMISSED_REQUESTS } = require('../state/constants')
const { parseUserOperationFromReport } = require('./evm-parse-user-operation')

const addCancelledTxHashToEvent = R.curry((_event, _finalizedTxHash) => {
  const id = _event[constants.db.KEY_ID]
  logger.debug(`Adding ${_finalizedTxHash} to ${id.slice(0, 20)}...`)
  const cancelledTimestamp = new Date().toISOString()
  const updatedEvent = {
    ..._event,
    [constants.db.KEY_FINAL_TX_TS]: cancelledTimestamp,
    [constants.db.KEY_FINAL_TX_HASH]: _finalizedTxHash,
    [constants.db.KEY_STATUS]: constants.db.txStatus.CANCELLED,
  }
  return Promise.resolve(updatedEvent)
})

const estimateGasErrorHandler = (_resolve, _reject, _report, _err) => {
  if (
    _err.message.includes(errors.ERROR_OPERATION_NOT_QUEUED) ||
    _err.message.includes(errors.ERROR_OPERATION_ALREADY_CANCELED) ||
    _err.message.includes(errors.ERROR_CHALLENGE_PERIOD_TERMINATED)
  ) {
    return _resolve(addCancelledTxHashToEvent(_report, '0x'))
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
  } else {
    logger.error(_err)
    return _resolve(addErrorToReport(_report, _err))
  }
}

const makeDismissalContractCall = R.curry(
  (_wallet, _hubAddress, _proof, _txTimeout, _report) =>
    new Promise((resolve, reject) => {
      const id = _report[constants.db.KEY_ID]
      const eventName = _report[constants.db.KEY_EVENT_NAME]
      const args = parseUserOperationFromReport(_report)
      const contract = new ethers.Contract(_hubAddress, abi, _wallet)

      logger.info(`Executing _id: ${id}`)
      const arrayify = _hexString => Uint8Array.from(Buffer.from(_hexString.slice(2), 'hex'))

      return checkEventName(eventName)
        .then(_ => utils.getEventId(_report))
        .then(_idHex => _wallet.signMessage(arrayify(_idHex)))
        .then(_signature =>
          contract.protocolCancelOperation(
            ...args,
            constants.hub.actors.Guardian,
            _proof,
            _signature
          )
        )
        .then(_tx => logger.debug('protocolCancelOperation called, awaiting...') || _tx.wait())
        .then(_receipt => logger.info('Tx mined successfully!') || _receipt)
        .then(R.prop(constants.evm.ethers.KEY_TX_HASH))
        .then(addCancelledTxHashToEvent(_report))
        .then(resolve)
        .catch(_err => errorHandler(resolve, reject, contract, _report, _err))
    })
)

const sendDismissalTransactions = R.curry(
  async (_reports, _hubAddress, _timeOut, _wallet, _proof) => {
    logger.info(`Sending final txs w/ address ${_wallet.address} w/ proof ${_proof}`)
    const updatedReports = []
    for (const report of _reports) {
      const newReport = await makeDismissalContractCall(
        _wallet,
        _hubAddress,
        _proof,
        _timeOut,
        report
      )
      if (utils.isNotNil(newReport)) updatedReports.push(newReport)
      await logic.sleepForXMilliseconds(1000) // TODO: make configurable
    }

    return updatedReports
  }
)

// TODO: function very similar to the one for building proposals...factor out?
const buildDismissalTxsAndPutInState = _state =>
  new Promise((resolve, reject) => {
    logger.info('Building dismissal txs...')
    const invalidRequests = _state[STATE_TO_BE_DISMISSED_REQUESTS] || []
    const providerUrl = _state[constants.state.KEY_PROVIDER_URL]
    const identityGpgFile = _state[constants.state.KEY_IDENTITY_FILE]
    const provider = new ethers.JsonRpcProvider(providerUrl)
    const txTimeout = _state[constants.state.KEY_TX_TIMEOUT]
    const hub = _state[constants.state.KEY_HUB_ADDRESS]
    const db = _state[constants.state.KEY_DB]
    const privateKey = utils.readIdentityFileSync(identityGpgFile)
    const wallet = new ethers.Wallet(privateKey, provider)

    return getMerkleProof(db, wallet.address)
      .then(sendDismissalTransactions(invalidRequests, hub, txTimeout, wallet))
      .then(addDismissedReportsToState(_state))
      .then(resolve)
      .catch(reject)
  })

const maybeBuildDismissalTxsAndPutInState = _state =>
  new Promise(resolve => {
    logger.info('Maybe building cancel transactions...')
    const networkId = _state[constants.state.KEY_NETWORK_ID]
    const blockChainName = utils.flipObjectPropertiesSync(ptokensUtilsConstants.networkIds)[
      networkId
    ]
    const invalidRequests = _state[STATE_TO_BE_DISMISSED_REQUESTS] || []

    return invalidRequests.length > 0
      ? resolve(buildDismissalTxsAndPutInState(_state))
      : logger.info(`No dismissal to process for ${blockChainName}...`) || resolve(_state)
  })

module.exports = {
  maybeBuildDismissalTxsAndPutInState,
}
