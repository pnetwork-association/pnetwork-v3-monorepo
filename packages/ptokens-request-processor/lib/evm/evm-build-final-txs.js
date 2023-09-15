const R = require('ramda')
const ethers = require('ethers')
const errors = require('../errors')
const constants = require('ptokens-constants')
const { logic } = require('ptokens-utils')
const { logger } = require('../get-logger')
const { addErrorToEvent } = require('../add-error-to-event')
const { readIdentityFile } = require('../read-identity-file')
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

// TODO: factor out (check evm-build-proposals-txs)
const addFinalizedTxHashToEvent = R.curry((_event, _finalizedTxHash) => {
  // TODO: replace _id field
  const id = _event[constants.db.KEY_ID]
  logger.debug(`Adding ${_finalizedTxHash} to ${id.slice(0, 20)}...`)
  const finalizedTimestamp = new Date().toISOString()
  const updatedEvent = {
    ..._event,
    [constants.db.KEY_FINAL_TX_TS]: finalizedTimestamp,
    [constants.db.KEY_FINAL_TX_HASH]: _finalizedTxHash,
    [constants.db.KEY_STATUS]: constants.db.txStatus.FINALIZED,
  }
  return Promise.resolve(updatedEvent)
})

const executeOperationErrorHandler = R.curry((resolve, reject, _eventReport, _err) => {
  if (_err.message.includes(errors.ERROR_OPERATION_ALREADY_EXECUTED)) {
    return resolve(addFinalizedTxHashToEvent(_eventReport, '0x'))
  } else if (_err.message.includes(errors.ERROR_CHALLENGE_PERIOD_NOT_TERMINATED)) {
    logger.error(_err.message)
    return resolve(null)
  } else {
    logger.error(_err)
    return resolve(addErrorToEvent(_eventReport, _err))
  }
})

const makeFinalContractCall = R.curry(
  (_wallet, _hubAddress, _txTimeout, _eventReport) =>
    new Promise((resolve, reject) => {
      const id = _eventReport[constants.db.KEY_ID]
      const eventName = _eventReport[constants.db.KEY_EVENT_NAME]

      if (!R.includes(eventName, R.values(constants.db.eventNames))) {
        return reject(new Error(`${errors.ERROR_INVALID_EVENT_NAME}: ${eventName}`))
      }

      const abi = getProtocolExecuteOperationAbi()
      const contractAddress = _hubAddress
      const functionName = 'protocolExecuteOperation'
      const args = getUserOperationAbiArgsFromReport(_eventReport)
      const hub = new ethers.Contract(contractAddress, abi, _wallet)

      logger.info(`Executing _id: ${id}`)
      logUserOperationFromAbiArgs(functionName, args)

      return callContractFunctionAndAwait(functionName, args, hub, _txTimeout)
        .then(R.prop(constants.evm.ethers.KEY_TX_HASH))
        .then(addFinalizedTxHashToEvent(_eventReport))
        .then(resolve)
        .catch(executeOperationErrorHandler(resolve, reject, _eventReport))
    })
)

const sendFinalTransactions = R.curry(async (_eventReports, _hubAddress, _timeOut, _wallet) => {
  logger.info(`Sending final txs w/ address ${_wallet.address}`)
  const newReports = []
  for (const report of _eventReports) {
    const newReport = await makeFinalContractCall(_wallet, _hubAddress, _timeOut, report)
    // If null, means there was an handled error which we need to retry later
    if (newReport !== null) newReports.push(newReport)
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

    return checkEventsHaveExpectedDestinationChainId(destinationNetworkId, proposedEvents)
      .then(_ => readIdentityFile(identityGpgFile))
      .then(_privateKey => new ethers.Wallet(_privateKey, provider))
      .then(sendFinalTransactions(proposedEvents, hub, txTimeout))
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
