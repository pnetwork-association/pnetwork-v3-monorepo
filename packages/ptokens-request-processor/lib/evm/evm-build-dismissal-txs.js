const ethers = require('ethers')

const constants = require('ptokens-constants')
const R = require('ramda')
const { ERROR_INVALID_EVENT_NAME, ERROR_OPERATION_NOT_QUEUED } = require('../errors')
const { logger } = require('../get-logger')
const { constants: ptokensUtilsConstants, errors, logic, utils } = require('ptokens-utils')
const { addDismissedReportsToState } = require('../state/state-operations.js')
const { STATE_TO_BE_DISMISSED_REQUESTS } = require('../state/constants')
const { callContractFunctionAndAwait } = require('./evm-call-contract-function')
const {
  logUserOperationFromAbiArgs,
  getUserOperationAbiArgsFromReport,
  getProtocolGuardianCancelOperationAbi,
} = require('./evm-abi-manager')
const { readIdentityFile } = require('../read-identity-file')

// TODO: factor out (check evm-build-proposals-txs)
const addCancelledTxHashToEvent = R.curry((_event, _finalizedTxHash) => {
  // TODO: replace _id field
  const id = _event[constants.db.KEY_ID]
  logger.debug(`Adding ${_finalizedTxHash} to ${id.slice(0, 20)}...`)
  const cancelledTimestamp = new Date().toISOString()
  _event[constants.db.KEY_FINAL_TX_TS] = cancelledTimestamp
  _event[constants.db.KEY_FINAL_TX_HASH] = _finalizedTxHash
  _event[constants.db.KEY_STATUS] = constants.db.txStatus.CANCELLED

  return Promise.resolve(_event)
})

const cancelOperationErrorHandler = R.curry((resolve, reject, _eventReport, _err) => {
  const reportId = _eventReport[constants.db.KEY_ID]
  if (_err.message.includes(errors.ERROR_TIMEOUT)) {
    logger.error(`Tx for ${reportId} failed:`, _err.message)
    return reject(_eventReport)
  } else if (_err.message.includes(ERROR_OPERATION_NOT_QUEUED)) {
    logger.error(`Tx for ${reportId} is not in the queue`)
    return resolve(addCancelledTxHashToEvent(_eventReport, '0x'))
  } else {
    logger.error(`Tx for ${reportId} failed with error: ${_err.message}`)
    return reject(_err)
  }
})

const makeDismissalContractCall = R.curry(
  (_wallet, _stateManager, _txTimeout, _eventReport) =>
    new Promise((resolve, reject) => {
      const id = _eventReport[constants.db.KEY_ID]
      const eventName = _eventReport[constants.db.KEY_EVENT_NAME]

      if (!R.includes(eventName, R.values(constants.db.eventNames))) {
        return reject(new Error(`${ERROR_INVALID_EVENT_NAME}: ${eventName}`))
      }

      const abi = getProtocolGuardianCancelOperationAbi()
      const contractAddress = _stateManager
      const functionName = 'protocolCancelOperation'
      const args = getUserOperationAbiArgsFromReport(_eventReport)
      const contract = new ethers.Contract(contractAddress, abi, _wallet)

      logger.info(`Executing _id: ${id}`)
      logUserOperationFromAbiArgs(functionName, args)

      return callContractFunctionAndAwait(functionName, args, contract, _txTimeout)
        .then(R.prop(constants.evm.ethers.KEY_TX_HASH))
        .then(addCancelledTxHashToEvent(_eventReport))
        .then(resolve)
        .catch(cancelOperationErrorHandler(resolve, reject, _eventReport))
    })
)

const sendDismissalTransaction = R.curry(
  (_eventReports, _stateManager, _timeOut, _wallet) =>
    logger.info(`Sending final txs w/ address ${_wallet.address}`) ||
    logic
      .executePromisesSequentially(
        _eventReports,
        makeDismissalContractCall(_wallet, _stateManager, _timeOut)
      )
      .then(logic.getFulfilledPromisesValues)
)

// TODO: function very similar to the one for building proposals...factor out?
const buildDismissalTxsAndPutInState = _state =>
  new Promise(resolve => {
    logger.info('Building dismissal txs...')
    const invalidRequests = _state[STATE_TO_BE_DISMISSED_REQUESTS] || []
    const providerUrl = _state[constants.state.KEY_PROVIDER_URL]
    const identityGpgFile = _state[constants.state.KEY_IDENTITY_FILE]
    const provider = new ethers.JsonRpcProvider(providerUrl)
    const txTimeout = _state[constants.state.KEY_TX_TIMEOUT]
    const stateManager = _state[constants.state.KEY_STATE_MANAGER_ADDRESS]

    return readIdentityFile(identityGpgFile)
      .then(_privateKey => new ethers.Wallet(_privateKey, provider))
      .then(sendDismissalTransaction(invalidRequests, stateManager, txTimeout))
      .then(addDismissedReportsToState(_state))
      .then(resolve)
  })

const maybeBuildDismissalTxsAndPutInState = _state =>
  new Promise(resolve => {
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
