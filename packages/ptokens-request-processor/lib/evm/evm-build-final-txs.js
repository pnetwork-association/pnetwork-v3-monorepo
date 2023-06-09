const ethers = require('ethers')

const constants = require('ptokens-constants')
const { logger } = require('../get-logger')
const { logic, errors } = require('ptokens-utils')
const { ERROR_INVALID_EVENT_NAME, ERROR_OPERATION_ALREADY_EXECUTED } = require('../errors')
const R = require('ramda')
const { addFinalizedEventsToState } = require('../state/state-operations.js')
const { STATE_PROPOSED_DB_REPORTS } = require('../state/constants')
const {
  checkEventsHaveExpectedDestinationChainId,
} = require('../check-events-have-expected-chain-id')
const { callContractFunctionAndAwait } = require('./evm-call-contract-function')
const {
  logUserOperationFromAbiArgs,
  getProtocolExecuteOperationAbi,
  getUserOperationAbiArgsFromReport,
} = require('./evm-abi-manager')
const { readIdentityFile } = require('../read-identity-file')

// TODO: factor out (check evm-build-proposals-txs)
const addFinalizedTxHashToEvent = R.curry((_event, _finalizedTxHash) => {
  // TODO: replace _id field
  const id = _event[constants.db.KEY_ID]
  logger.debug(`Adding ${_finalizedTxHash} to ${id.slice(0, 20)}...`)
  const finalizedTimestamp = new Date().toISOString()
  _event[constants.db.KEY_FINAL_TX_TS] = finalizedTimestamp
  _event[constants.db.KEY_FINAL_TX_HASH] = _finalizedTxHash
  _event[constants.db.KEY_STATUS] = constants.db.txStatus.FINALIZED

  return Promise.resolve(_event)
})

const executeOperationErrorHandler = R.curry((resolve, reject, _eventReport, _err) => {
  const reportId = _eventReport[constants.db.KEY_ID]
  if (_err.message.includes(errors.ERROR_TIMEOUT)) {
    logger.error(`Tx for ${reportId} failed:`, _err.message)
    return reject(_eventReport)
  } else if (_err.message.includes(ERROR_OPERATION_ALREADY_EXECUTED)) {
    logger.error(`Tx for ${reportId} has already been executed`)
    return resolve(addFinalizedTxHashToEvent(_eventReport, '0x'))
  } else {
    logger.error(`Tx for ${reportId} failed with error: ${_err.message}`)
    return reject(_err)
  }
})

const makeFinalContractCall = R.curry(
  (_wallet, _stateManager, _txTimeout, _eventReport) =>
    new Promise((resolve, reject) => {
      const id = _eventReport[constants.db.KEY_ID]
      const eventName = _eventReport[constants.db.KEY_EVENT_NAME]

      if (!R.includes(eventName, R.values(constants.db.eventNames))) {
        return reject(new Error(`${ERROR_INVALID_EVENT_NAME}: ${eventName}`))
      }

      const abi = getProtocolExecuteOperationAbi()
      const contractAddress = _stateManager
      const functionName = 'protocolExecuteOperation'
      const args = getUserOperationAbiArgsFromReport(_eventReport)
      const contract = new ethers.Contract(contractAddress, abi, _wallet)

      logger.info(`Executing _id: ${id}`)
      logUserOperationFromAbiArgs(functionName, args)

      return callContractFunctionAndAwait(functionName, args, contract, _txTimeout)
        .then(R.prop(constants.evm.ethers.KEY_TX_HASH))
        .then(addFinalizedTxHashToEvent(_eventReport))
        .then(resolve)
        .catch(executeOperationErrorHandler(resolve, reject, _eventReport))
    })
)

const sendFinalTransactions = R.curry(
  (_eventReports, _stateManager, _timeOut, _wallet) =>
    logger.info(`Sending final txs w/ address ${_wallet.address}`) ||
    logic
      .executePromisesSequentially(
        _eventReports,
        makeFinalContractCall(_wallet, _stateManager, _timeOut)
      )
      .then(logic.getFulfilledPromisesValues)
)

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
    const stateManager = _state[constants.state.KEY_STATE_MANAGER_ADDRESS]

    return checkEventsHaveExpectedDestinationChainId(destinationNetworkId, proposedEvents)
      .then(_ => readIdentityFile(identityGpgFile))
      .then(_privateKey => new ethers.Wallet(_privateKey, provider))
      .then(sendFinalTransactions(proposedEvents, stateManager, txTimeout))
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
