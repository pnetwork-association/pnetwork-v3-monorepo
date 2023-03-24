const ethers = require('ethers')
const schemas = require('ptokens-schemas')
const constants = require('ptokens-constants')
const { logger } = require('../get-logger')
const { readFile } = require('fs/promises')
const { errors } = require('ptokens-utils')
const { ERROR_INVALID_EVENT_NAME } = require('../errors')
const { curry, values, includes, length, prop } = require('ramda')
const { addFinalizedEventsToState } = require('../state/state-operations.js')
const { STATE_PROPOSED_DB_REPORTS_KEY } = require('../state/constants')
const {
  checkEventsHaveExpectedDestinationChainId,
} = require('../check-events-have-expected-chain-id')
const { callContractFunctionAndAwait } = require('./evm-call-contract-function')

const ABI_CALL_ISSUE = ['function callIssue(string _requestId)']
const ABI_CALL_REDEEM = ['function callRedeem(string _requestId)']

// TODO: factor out (check evm-build-proposals-txs)
const addFinalizedTxHashToEvent = curry((_event, _finalizedTxHash) => {
  // TODO: replace _id field
  const id = _event[schemas.constants.SCHEMA_ID_KEY]
  logger.debug(`Adding ${_finalizedTxHash} to ${id.slice(0, 20)}...`)
  const finalizedTimestamp = new Date().toISOString()
  _event[schemas.constants.SCHEMA_FINAL_TX_TS_KEY] = finalizedTimestamp
  _event[schemas.constants.SCHEMA_FINAL_TX_HASH_KEY] = _finalizedTxHash
  _event[schemas.constants.SCHEMA_STATUS_KEY] =
    schemas.db.enums.txStatus.FINALIZED

  return Promise.resolve(_event)
})

const makeFinalContractCall = curry(
  (_wallet, _issuanceManager, _redeemManager, _txTimeout, _eventReport) =>
    new Promise((resolve, reject) => {
      const eventName = _eventReport[schemas.constants.SCHEMA_EVENT_NAME_KEY]
      const originTx =
        _eventReport[schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]

      if (!includes(eventName, values(schemas.db.enums.eventNames))) {
        return reject(new Error(`${ERROR_INVALID_EVENT_NAME}: ${eventName}`))
      }

      const abi =
        eventName === schemas.db.enums.eventNames.PEGIN
          ? ABI_CALL_ISSUE
          : ABI_CALL_REDEEM

      const args = [originTx]

      const contractAddress =
        eventName === schemas.db.enums.eventNames.PEGIN
          ? _issuanceManager
          : _redeemManager

      const functionName =
        eventName === schemas.db.enums.eventNames.PEGIN
          ? 'callIssue'
          : 'callRedeem'

      const contract = new ethers.Contract(contractAddress, abi, _wallet)

      logger.info(`Processing final transaction ${eventName}:`)
      logger.info(`  eventName: ${eventName}`)
      logger.info(`  originTx: ${originTx}`)

      return callContractFunctionAndAwait(
        functionName,
        args,
        contract,
        _txTimeout
      )
        .then(prop('transactionHash')) // TODO: store in a constant
        .then(addFinalizedTxHashToEvent(_eventReport))
        .then(resolve)
        .catch(_err =>
          _err.message.includes(errors.ERROR_TIMEOUT)
            ? logger.error(
                `Final transaction for ${originTx} failed:`,
                _err.message
              ) || resolve()
            : reject(_err)
        )
    })
)

const sendFinalTransactions = curry(
  (_eventReports, _issuanceManager, _redeemManager, _timeOut, _wallet) =>
    logger.info(`Sending final txs w/ address ${_wallet.address}`) ||
    Promise.all(
      _eventReports.map(
        makeFinalContractCall(
          _wallet,
          _issuanceManager,
          _redeemManager,
          _timeOut
        )
      )
    )
)

// TODO: function very similar to the one for building proposals...factor out?
const buildFinalTxsAndPutInState = _state =>
  new Promise(resolve => {
    logger.info('Building final txs...')
    const proposedEvents = _state[STATE_PROPOSED_DB_REPORTS_KEY]
    const destinationChainId = _state[constants.state.STATE_KEY_CHAIN_ID]
    const providerUrl = _state[constants.state.STATE_KEY_PROVIDER_URL]
    const identityGpgFile = _state[constants.state.STATE_KEY_IDENTITY_FILE]
    const provider = new ethers.providers.JsonRpcProvider(providerUrl)
    const txTimeout = _state[schemas.constants.SCHEMA_TX_TIMEOUT]

    const issuanceManagerAddress =
      _state[constants.state.STATE_KEY_ISSUANCE_MANAGER_ADDRESS]
    const redeemManagerAddress =
      _state[constants.state.STATE_KEY_REDEEM_MANAGER_ADDRESS]

    return (
      checkEventsHaveExpectedDestinationChainId(
        destinationChainId,
        proposedEvents
      )
        // FIXME
        // .then(_ => utils.readGpgEncryptedFile(identityGpgFile))
        .then(_ => readFile(identityGpgFile, { encoding: 'utf8' }))
        .then(_privateKey => new ethers.Wallet(_privateKey, provider))
        .then(
          sendFinalTransactions(
            proposedEvents,
            issuanceManagerAddress,
            redeemManagerAddress,
            txTimeout
          )
        )
        .then(addFinalizedEventsToState(_state))
        .then(resolve)
    )
  })

const maybeBuildFinalTxsAndPutInState = _state =>
  new Promise(resolve => {
    logger.info('Maybe building final txs...')
    const proposedEvents = _state[STATE_PROPOSED_DB_REPORTS_KEY] || []
    const proposedEventsNumber = length(proposedEvents)

    return proposedEventsNumber === 0
      ? logger.info('No proposals found...') || resolve(_state)
      : logger.info(`Found ${proposedEventsNumber} proposals to process...`) ||
          buildFinalTxsAndPutInState(_state).then(resolve)
  })

module.exports = {
  makeFinalContractCall,
  maybeBuildFinalTxsAndPutInState,
}
