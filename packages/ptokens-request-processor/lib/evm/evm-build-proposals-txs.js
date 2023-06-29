const R = require('ramda')
const ethers = require('ethers')
const errors = require('../errors')
const constants = require('ptokens-constants')
const { logic } = require('ptokens-utils')
const { logger } = require('../get-logger')
const { addProposalsReportsToState } = require('../state/state-operations.js')
const { STATE_DETECTED_DB_REPORTS } = require('../state/constants')
const {
  checkEventsHaveExpectedDestinationChainId,
} = require('../check-events-have-expected-chain-id')
const { callContractFunctionAndAwait } = require('./evm-call-contract-function')
const {
  logUserOperationFromAbiArgs,
  getProtocolQueueOperationAbi,
  getUserOperationAbiArgsFromReport,
  getLockedAmountChallengePeriodAbi,
} = require('./evm-abi-manager')
const { readIdentityFile } = require('../read-identity-file')
const { addErrorToEvent } = require('../add-error-to-event')

// TODO: factor out (check evm-build-final-txs)
const addProposedTxHashToEvent = R.curry(
  (_event, _proposedTxHash) =>
    new Promise((resolve, _) => {
      // TODO: replace _id field
      logger.debug(`Adding ${_proposedTxHash} to ${_event._id.slice(0, 20)}...`)
      const proposedTimestamp = new Date().toISOString()
      _event[constants.db.KEY_PROPOSAL_TS] = proposedTimestamp
      _event[constants.db.KEY_PROPOSAL_TX_HASH] = _proposedTxHash
      _event[constants.db.KEY_STATUS] = constants.db.txStatus.PROPOSED

      return resolve(_event)
    })
)

const queueOperationErrorHandler = R.curry((resolve, reject, _eventReport, _err) =>
  _err.message.includes(errors.ERROR_OPERATION_ALREADY_QUEUED)
    ? resolve(addProposedTxHashToEvent(_eventReport, '0x'))
    : logger.error(_err) || resolve(addErrorToEvent(_eventReport, _err))
)

const makeProposalContractCall = R.curry(
  (_wallet, _managerAddress, _txTimeout, _amountToLock, _eventReport) =>
    new Promise((resolve, reject) => {
      const id = _eventReport[constants.db.KEY_ID]
      const eventName = _eventReport[constants.db.KEY_EVENT_NAME]

      if (!R.includes(eventName, R.values(constants.db.eventNames))) {
        return reject(new Error(`${errors.ERROR_INVALID_EVENT_NAME}: ${eventName}`))
      }

      const abi = getProtocolQueueOperationAbi()
      const args = getUserOperationAbiArgsFromReport(_eventReport)

      args.push({ value: _amountToLock })
      const functionName = 'protocolQueueOperation'
      const contract = new ethers.Contract(_managerAddress, abi, _wallet)

      logger.info(`Queueing _id: ${id} w/ locked amount ${_amountToLock}`)
      logUserOperationFromAbiArgs(functionName, args)

      return callContractFunctionAndAwait(functionName, args, contract, _txTimeout)
        .then(R.prop(constants.evm.ethers.KEY_TX_HASH))
        .then(addProposedTxHashToEvent(_eventReport))
        .then(resolve)
        .catch(queueOperationErrorHandler(resolve, reject, _eventReport))
    })
)

const sendProposalTransactions = R.curry(
  async (_eventReports, _stateManager, _timeOut, _wallet, _amountToLock) => {
    logger.info(`Sending proposals w/ address ${_wallet.address}`)
    const newReports = []
    for (const report of _eventReports) {
      const newReport = await makeProposalContractCall(
        _wallet,
        _stateManager,
        _timeOut,
        _amountToLock,
        report
      )
      newReports.push(newReport)
      await logic.sleepForXMilliseconds(1000) // TODO: make configurable
    }

    return newReports
  }
)

const getLockedAmountChallengePeriod = (_stateManagerAddress, _provider) =>
  new Promise(resolve => {
    const abi = getLockedAmountChallengePeriodAbi()
    const stateManagerContract = new ethers.Contract(_stateManagerAddress, abi, _provider)

    return resolve(stateManagerContract.lockedAmountChallengePeriod())
  })

const buildProposalsTxsAndPutInState = _state =>
  new Promise(resolve => {
    logger.info('Building proposals txs...')
    const detectedEvents = _state[STATE_DETECTED_DB_REPORTS]

    if (detectedEvents.length === 0)
      return logger.info('No new operations detected...') || resolve(_state)

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
        .then(_privateKey =>
          Promise.all([
            new ethers.Wallet(_privateKey, provider),
            getLockedAmountChallengePeriod(managerAddress, provider),
          ])
        )
        .then(([_wallet, _amountToLock]) =>
          sendProposalTransactions(
            detectedEvents,
            managerAddress,
            txTimeout,
            _wallet,
            _amountToLock
          )
        )
        .then(addProposalsReportsToState(_state))
        .then(resolve)
    )
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
