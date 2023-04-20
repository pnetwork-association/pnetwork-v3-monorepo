const ethers = require('ethers')
const schemas = require('ptokens-schemas')
const constants = require('ptokens-constants')
const { logger } = require('../get-logger')
const { readFile } = require('fs/promises')
const { logic, errors } = require('ptokens-utils')
const {
  ERROR_INVALID_EVENT_NAME,
  ERROR_OPERATION_ALREADY_EXECUTED,
} = require('../errors')
const R = require('ramda')
const { addFinalizedEventsToState } = require('../state/state-operations.js')
const { STATE_PROPOSED_DB_REPORTS_KEY } = require('../state/constants')
const {
  checkEventsHaveExpectedDestinationChainId,
} = require('../check-events-have-expected-chain-id')
const { callContractFunctionAndAwait } = require('./evm-call-contract-function')
const {
  logUserOperationFromAbiArgs,
  getProtocolExecuteOperationAbi,
  getUserOperationAbiArgsFromReport,
} = require('./evm-abi-manager')

// TODO: factor out (check evm-build-proposals-txs)
const addFinalizedTxHashToEvent = R.curry((_event, _finalizedTxHash) => {
  // TODO: replace _id field
  const id = _event[schemas.constants.reportFields.SCHEMA_ID_KEY]
  logger.debug(`Adding ${_finalizedTxHash} to ${id.slice(0, 20)}...`)
  const finalizedTimestamp = new Date().toISOString()
  _event[schemas.constants.reportFields.SCHEMA_FINAL_TX_TS_KEY] =
    finalizedTimestamp
  _event[schemas.constants.reportFields.SCHEMA_FINAL_TX_HASH_KEY] =
    _finalizedTxHash
  _event[schemas.constants.reportFields.SCHEMA_STATUS_KEY] =
    schemas.db.enums.txStatus.FINALIZED

  return Promise.resolve(_event)
})

const executeOperationErrorHandler = R.curry(
  (resolve, reject, _eventReport, _err) => {
    const reportId = _eventReport[schemas.constants.reportFields.SCHEMA_ID_KEY]
    if (_err.message.includes(errors.ERROR_TIMEOUT)) {
      logger.error(`Tx for ${reportId} failed:`, _err.message)
      return resolve(_eventReport)
    } else if (_err.message.includes(ERROR_OPERATION_ALREADY_EXECUTED)) {
      logger.error(`Tx for ${reportId} has already been executed`)
      return resolve(addFinalizedTxHashToEvent(_eventReport, '0x'))
    } else {
      return reject(_err)
    }
  }
)

const makeFinalContractCall = R.curry(
  (_wallet, _stateManager, _txTimeout, _eventReport) =>
    new Promise((resolve, reject) => {
      const id = _eventReport[schemas.constants.reportFields.SCHEMA_ID_KEY]
      const eventName =
        _eventReport[schemas.constants.reportFields.SCHEMA_EVENT_NAME_KEY]

      if (!R.includes(eventName, R.values(schemas.db.enums.eventNames))) {
        return reject(new Error(`${ERROR_INVALID_EVENT_NAME}: ${eventName}`))
      }

      const abi = getProtocolExecuteOperationAbi()
      const contractAddress = _stateManager
      const functionName = 'protocolExecuteOperation'
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
        .then(R.prop(constants.misc.ETHERS_KEY_TX_HASH))
        .then(addFinalizedTxHashToEvent(_eventReport))
        .then(resolve)
        .catch(executeOperationErrorHandler(resolve, reject, _eventReport))
    })
)

const sendFinalTransactions = R.curry(
  (_eventReports, _stateManager, _timeOut, _wallet) =>
    logger.info(`Sending final txs w/ address ${_wallet.address}`) ||
    Promise.all(
      _eventReports.map((_eventReport, _i) =>
        logic
          .sleepForXMilliseconds(1000 * _i)
          .then(_ =>
            makeFinalContractCall(
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
const buildFinalTxsAndPutInState = _state =>
  new Promise(resolve => {
    logger.info('Building final txs...')
    const proposedEvents = _state[STATE_PROPOSED_DB_REPORTS_KEY]
    const destinationNetworkId = _state[constants.state.STATE_KEY_NETWORK_ID]
    const providerUrl = _state[constants.state.STATE_KEY_PROVIDER_URL]
    const identityGpgFile = _state[constants.state.STATE_KEY_IDENTITY_FILE]
    const provider = new ethers.JsonRpcProvider(providerUrl)
    const txTimeout = _state[constants.state.STATE_KEY_TX_TIMEOUT]
    const stateManager = _state[constants.state.STATE_KEY_STATE_MANAGER_ADDRESS]

    return (
      checkEventsHaveExpectedDestinationChainId(
        destinationNetworkId,
        proposedEvents
      )
        // FIXME
        // .then(_ => utils.readGpgEncryptedFile(identityGpgFile))
        .then(_ => readFile(identityGpgFile, { encoding: 'utf8' }))
        .then(_privateKey => new ethers.Wallet(_privateKey, provider))
        .then(sendFinalTransactions(proposedEvents, stateManager, txTimeout))
        .then(addFinalizedEventsToState(_state))
        .then(resolve)
    )
  })

const maybeBuildFinalTxsAndPutInState = _state =>
  new Promise(resolve => {
    logger.info('Maybe building final txs...')
    const proposedEvents = _state[STATE_PROPOSED_DB_REPORTS_KEY] || []
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
