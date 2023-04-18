const ethers = require('ethers')
const schemas = require('ptokens-schemas')
const constants = require('ptokens-constants')
const R = require('ramda')
const {
  ERROR_INVALID_EVENT_NAME,
  ERROR_OPERATION_NOT_QUEUED,
} = require('../errors')
const { readFile } = require('fs/promises')
const { logger } = require('../get-logger')
const {
  constants: ptokensUtilsConstants,
  errors,
  logic,
  utils,
} = require('ptokens-utils')
const { addDismissedReportsToState } = require('../state/state-operations.js')
const { STATE_TO_BE_DISMISSED_REQUESTS_KEY } = require('../state/constants')
const { callContractFunctionAndAwait } = require('./evm-call-contract-function')
const {
  logUserOperationFromAbiArgs,
  getProtocolCancelOperationAbi,
  getUserOperationAbiArgsFromReport,
} = require('./evm-abi-manager')

// TODO: factor out (check evm-build-proposals-txs)
const addCancelledTxHashToEvent = R.curry((_event, _finalizedTxHash) => {
  // TODO: replace _id field
  const id = _event[schemas.constants.SCHEMA_ID_KEY]
  logger.debug(`Adding ${_finalizedTxHash} to ${id.slice(0, 20)}...`)
  const cancelledTimestamp = new Date().toISOString()
  _event[schemas.constants.SCHEMA_FINAL_TX_TS_KEY] = cancelledTimestamp
  _event[schemas.constants.SCHEMA_FINAL_TX_HASH_KEY] = _finalizedTxHash
  _event[schemas.constants.SCHEMA_STATUS_KEY] =
    schemas.db.enums.txStatus.CANCELLED

  return Promise.resolve(_event)
})

const makeDismissalContractCall = R.curry(
  (_wallet, _stateManager, _txTimeout, _eventReport) =>
    new Promise((resolve, reject) => {
      const id = _eventReport[schemas.constants.SCHEMA_ID_KEY]
      const eventName = _eventReport[schemas.constants.SCHEMA_EVENT_NAME_KEY]

      if (!R.includes(eventName, R.values(schemas.db.enums.eventNames))) {
        return reject(new Error(`${ERROR_INVALID_EVENT_NAME}: ${eventName}`))
      }

      const abi = getProtocolCancelOperationAbi()
      const contractAddress = _stateManager
      const functionName = 'protocolCancelOperation'
      const args = getUserOperationAbiArgsFromReport(_eventReport)
      const contract = new ethers.Contract(contractAddress, abi, _wallet)

      logger.info(`Executing _id: ${id}`)
      logUserOperationFromAbiArgs(functionName, args)

      return callContractFunctionAndAwait(
        functionName,
        args,
        contract,
        _txTimeout
      )
        .then(R.prop('hash')) // TODO: store in a constant
        .then(addCancelledTxHashToEvent(_eventReport))
        .then(resolve)
        .catch(_err => {
          const reportId = _eventReport[schemas.constants.SCHEMA_ID_KEY]
          if (_err.message.includes(errors.ERROR_TIMEOUT)) {
            logger.error(`Tx for ${reportId} failed:`, _err.message)
            return resolve(_eventReport)
          } else if (_err.message.includes(ERROR_OPERATION_NOT_QUEUED)) {
            logger.error(`Tx for ${reportId} is not in the queue`)
            return resolve(addCancelledTxHashToEvent(_eventReport, '0x'))
          } else {
            return reject(_err)
          }
        })
    })
)

const sendDismissalTransaction = R.curry(
  (_eventReports, _stateManager, _timeOut, _wallet) =>
    logger.info(`Sending final txs w/ address ${_wallet.address}`) ||
    Promise.all(
      _eventReports.map((_eventReport, _i) =>
        logic
          .sleepForXMilliseconds(1000 * _i)
          .then(_ =>
            makeDismissalContractCall(
              _wallet,
              _stateManager,
              _timeOut,
              _eventReport
            )
          )
      )
    )
)

// TODO: function very similar to the one for building proposals...factor out?
const buildDismissalTxsAndPutInState = _state =>
  new Promise(resolve => {
    logger.info('Building dismissal txs...')
    const invalidRequests = _state[STATE_TO_BE_DISMISSED_REQUESTS_KEY] || []
    const providerUrl = _state[constants.state.STATE_KEY_PROVIDER_URL]
    const identityGpgFile = _state[constants.state.STATE_KEY_IDENTITY_FILE]
    const provider = new ethers.JsonRpcProvider(providerUrl)
    const txTimeout = _state[constants.state.STATE_KEY_TX_TIMEOUT]
    const stateManager = _state[constants.state.STATE_KEY_STATE_MANAGER_ADDRESS]

    return readFile(identityGpgFile, { encoding: 'utf8' })
      .then(_privateKey => new ethers.Wallet(_privateKey, provider))
      .then(sendDismissalTransaction(invalidRequests, stateManager, txTimeout))
      .then(addDismissedReportsToState(_state))
      .then(resolve)
  })

const maybeBuildDismissalTxsAndPutInState = _state =>
  new Promise(resolve => {
    const networkId = _state[constants.state.STATE_KEY_NETWORK_ID]
    const blockChainName = utils.flipObjectPropertiesSync(
      ptokensUtilsConstants.networkIds
    )[networkId]
    const invalidRequests = _state[STATE_TO_BE_DISMISSED_REQUESTS_KEY] || []

    return invalidRequests.length > 0
      ? resolve(buildDismissalTxsAndPutInState(_state))
      : logger.info(`No dismissal to process for ${blockChainName}...`) ||
          resolve(_state)
  })

module.exports = {
  maybeBuildDismissalTxsAndPutInState,
}
