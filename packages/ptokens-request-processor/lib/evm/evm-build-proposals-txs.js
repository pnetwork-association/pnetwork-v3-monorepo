const ethers = require('ethers')
const constants = require('ptokens-constants')
const schemas = require('ptokens-schemas')
const { logger } = require('../get-logger')
const { errors, logic } = require('ptokens-utils')
const { ERROR_INVALID_EVENT_NAME, ERROR_OPERATION_ALREADY_QUEUED } = require('../errors')
const R = require('ramda')
const { addProposalsReportsToState } = require('../state/state-operations.js')
const { STATE_DETECTED_DB_REPORTS_KEY } = require('../state/constants')
const {
  checkEventsHaveExpectedDestinationChainId,
} = require('../check-events-have-expected-chain-id')
const { callContractFunctionAndAwait } = require('./evm-call-contract-function')
const {
  logUserOperationFromAbiArgs,
  getProtocolQueueOperationAbi,
  getUserOperationAbiArgsFromReport,
} = require('./evm-abi-manager')
const { readIdentityFile } = require('../read-identity-file')

// TODO: factor out (check evm-build-final-txs)
const addProposedTxHashToEvent = R.curry(
  (_event, _proposedTxHash) =>
    new Promise((resolve, _) => {
      // TODO: replace _id field
      logger.debug(`Adding ${_proposedTxHash} to ${_event._id.slice(0, 20)}...`)
      const proposedTimestamp = new Date().toISOString()
      _event[schemas.constants.reportFields.SCHEMA_PROPOSAL_TS_KEY] = proposedTimestamp
      _event[schemas.constants.reportFields.SCHEMA_PROPOSAL_TX_HASH_KEY] = _proposedTxHash
      _event[schemas.constants.reportFields.SCHEMA_STATUS_KEY] = schemas.db.enums.txStatus.PROPOSED

      return resolve(_event)
    })
)

const queueOperationErrorHandler = R.curry((resolve, reject, _eventReport, _err) => {
  const reportId = _eventReport[schemas.constants.reportFields.SCHEMA_ID_KEY]
  if (_err.message.includes(errors.ERROR_TIMEOUT)) {
    logger.error(`Tx for ${reportId} failed:`, _err.message)
    return resolve(_eventReport)
  } else if (_err.message.includes(ERROR_OPERATION_ALREADY_QUEUED)) {
    logger.error(`Tx for ${reportId} has already been queued`)
    return addProposedTxHashToEvent(_eventReport, '0x').then(resolve)
  } else {
    return reject(_err)
  }
})
const makeProposalContractCall = R.curry(
  (_wallet, _managerContract, _txTimeout, _eventReport) =>
    new Promise((resolve, reject) => {
      const id = _eventReport[schemas.constants.reportFields.SCHEMA_ID_KEY]
      const eventName = _eventReport[schemas.constants.reportFields.SCHEMA_EVENT_NAME_KEY]

      if (!R.includes(eventName, R.values(constants.db.eventNames))) {
        return reject(new Error(`${ERROR_INVALID_EVENT_NAME}: ${eventName}`))
      }

      const abi = getProtocolQueueOperationAbi()
      const args = getUserOperationAbiArgsFromReport(_eventReport)
      const functionName = 'protocolQueueOperation'
      const contract = new ethers.Contract(_managerContract, abi, _wallet)

      logger.info(`Executing _id: ${id}`)
      logUserOperationFromAbiArgs(functionName, args)

      return callContractFunctionAndAwait(functionName, args, contract, _txTimeout)
        .then(R.prop(constants.evm.ethers.KEY_TX_HASH))
        .then(addProposedTxHashToEvent(_eventReport))
        .then(resolve)
        .catch(queueOperationErrorHandler(resolve, reject, _eventReport))
    })
)

const sendProposalTransactions = R.curry(
  (_eventReports, _manager, _timeOut, _wallet) =>
    logger.info(`Sending proposals w/ address ${_wallet.address}`) ||
    Promise.all(
      _eventReports.map((_eventReport, _i) =>
        logic
          .sleepForXMilliseconds(1000 * _i)
          .then(_ => makeProposalContractCall(_wallet, _manager, _timeOut, _eventReport))
      )
    )
)
const buildProposalsTxsAndPutInState = _state =>
  new Promise(resolve => {
    logger.info('Building proposals txs...')
    const detectedEvents = _state[STATE_DETECTED_DB_REPORTS_KEY]
    const destinationNetworkId = _state[constants.state.KEY_NETWORK_ID]
    const providerUrl = _state[constants.state.KEY_PROVIDER_URL]
    const identityGpgFile = _state[constants.state.KEY_IDENTITY_FILE]
    const managerAddress = _state[constants.state.KEY_STATE_MANAGER_ADDRESS]
    const txTimeout = _state[constants.state.KEY_TX_TIMEOUT]
    const provider = new ethers.JsonRpcProvider(providerUrl)

    return (
      checkEventsHaveExpectedDestinationChainId(destinationNetworkId, detectedEvents)
        // FIXME: use gpg decrypt
        .then(_ => readIdentityFile(identityGpgFile))
        .then(_privateKey => new ethers.Wallet(_privateKey, provider))
        .then(sendProposalTransactions(detectedEvents, managerAddress, txTimeout))
        .then(addProposalsReportsToState(_state))
        .then(resolve)
    )
  })

const maybeBuildProposalsTxsAndPutInState = _state =>
  new Promise(resolve => {
    logger.info('Maybe building proposals txs...')
    const detectedEvents = _state[STATE_DETECTED_DB_REPORTS_KEY]
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
