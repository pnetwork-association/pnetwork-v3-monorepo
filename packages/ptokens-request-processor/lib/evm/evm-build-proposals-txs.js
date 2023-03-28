const ethers = require('ethers')
const { readFile } = require('fs/promises')
const constants = require('ptokens-constants')
const schemas = require('ptokens-schemas')
const { logger } = require('../get-logger')
const { errors } = require('ptokens-utils')
const { ERROR_INVALID_EVENT_NAME } = require('../errors')
const { curry, prop, values, includes, length } = require('ramda')
const { addProposalsReportsToState } = require('../state/state-operations.js')
const { STATE_DETECTED_DB_REPORTS_KEY } = require('../state/constants')
const {
  checkEventsHaveExpectedDestinationChainId,
} = require('../check-events-have-expected-chain-id')
const { callContractFunctionAndAwait } = require('./evm-call-contract-function')

const ABI_QUEUE_OPERATION = [
  'function protocolQueueOperation(' +
    'bytes32 originBlockHash,' +
    'bytes32 originTransactionHash,' +
    'bytes4 originNetworkChainId,' +
    'uint256 nonce,' +
    'address destinationAccount,' +
    'string calldata underlyingAssetName,' +
    'string calldata underlyingAssetSymbol,' +
    'address underlyingAssetTokenAddress,' +
    'uint256 underlyingAssetChainId,' +
    'uint256 amount,' +
    'bytes calldata userData,' +
    'bytes32 optionsMask' +
    ')',
]

// TODO: factor out (check evm-build-final-txs)
const addProposedTxHashToEvent = curry((_event, _proposedTxHash) => {
  // TODO: replace _id field
  logger.debug(`Adding ${_proposedTxHash} to ${_event._id.slice(0, 20)}...`)
  const proposedTimestamp = new Date().toISOString()
  _event[schemas.constants.SCHEMA_PROPOSAL_TS_KEY] = proposedTimestamp
  _event[schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY] = _proposedTxHash
  _event[schemas.constants.SCHEMA_STATUS_KEY] =
    schemas.db.enums.txStatus.PROPOSED

  return Promise.resolve(_event)
})

const makeProposalContractCall = curry(
  (_wallet, _managerContract, _txTimeout, _eventReport) =>
    new Promise((resolve, reject) => {
      const id = _eventReport[schemas.constants.SCHEMA_ID_KEY]
      const nonce = _eventReport[schemas.constants.SCHEMA_NONCE_KEY]
      const amount = _eventReport[schemas.constants.SCHEMA_AMOUNT_KEY]
      const userData = _eventReport[schemas.constants.SCHEMA_USER_DATA_KEY]
      const eventName = _eventReport[schemas.constants.SCHEMA_EVENT_NAME_KEY]
      const originChainId =
        _eventReport[schemas.constants.SCHEMA_ORIGINATING_NETWORK_ID_KEY]
      const originBlockHash =
        _eventReport[schemas.constants.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]
      const originatingTxHash =
        _eventReport[schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]
      const destinationAddress =
        _eventReport[schemas.constants.SCHEMA_DESTINATION_ADDRESS_KEY]
      const underlyingAssetName =
        _eventReport[schemas.constants.SCHEMA_UNDERLYING_ASSET_NAME_KEY]
      const underlyingAssetSymbol =
        _eventReport[schemas.constants.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]
      const underlyingAssetChainId =
        _eventReport[schemas.constants.SCHEMA_UNDERLYING_ASSET_CHAIN_ID_KEY]
      const underlyingAssetTokenAddress =
        _eventReport[
          schemas.constants.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY
        ]

      const optionsMask = _eventReport[schemas.constants.SCHEMA_OPTIONS_MASK]

      if (!includes(eventName, values(schemas.db.enums.eventNames))) {
        return reject(new Error(`${ERROR_INVALID_EVENT_NAME}: ${eventName}`))
      }

      const abi = ABI_QUEUE_OPERATION
      const args = [
        originBlockHash,
        originatingTxHash,
        originChainId,
        nonce,
        destinationAddress,
        underlyingAssetName,
        underlyingAssetSymbol,
        underlyingAssetTokenAddress,
        underlyingAssetChainId,
        amount,
        userData,
        optionsMask,
      ]
      const functionName = 'protocolQueueOperation'
      const contract = new ethers.Contract(_managerContract, abi, _wallet)

      logger.info(`Processing _id: ${id}`)
      logger.info('function protocolQueueOperation(')
      logger.info(`  bytes32 originBlockHash: ${originBlockHash}`)
      logger.info(`  bytes32 originTransactionHash: ${originatingTxHash}`)
      logger.info(`  bytes4 originNetworkChainId: ${originChainId}`)
      logger.info(`  uint256 nonce: ${nonce}`)
      logger.info(`  address destinationAccount: ${destinationAddress}`)
      logger.info(
        `  string calldata:  underlyingAssetName ${underlyingAssetName}`
      )
      logger.info(
        `  string calldata:  underlyingAssetSymbol ${underlyingAssetSymbol}`
      )
      logger.info(
        `  address underlyingAssetTokenAddress: ${underlyingAssetTokenAddress}`
      )
      logger.info(`  uint256 underlyingAssetChainId: ${underlyingAssetChainId}`)
      logger.info(`  uint256 amount: ${amount}`)
      logger.info(`  bytes calldata:  userData ${userData}`)
      logger.info(`  bytes32 optionsMask: ${optionsMask}`)
      logger.info(')')

      return callContractFunctionAndAwait(
        functionName,
        args,
        contract,
        _txTimeout
      )
        .then(prop('transactionHash')) // TODO: store in a constant
        .then(addProposedTxHashToEvent(_eventReport))
        .then(resolve)
        .catch(_err =>
          _err.message.includes(errors.ERROR_TIMEOUT)
            ? logger.error(
                `Tx for ${originatingTxHash} failed:`,
                _err.message
              ) || resolve()
            : reject(_err)
        )
    })
)

const sendProposalTransactions = curry(
  (_eventReports, _manager, _timeOut, _wallet) =>
    logger.info(`Sending proposals w/ address ${_wallet.address}`) ||
    Promise.all(
      _eventReports.map(makeProposalContractCall(_wallet, _manager, _timeOut))
    )
)

const buildProposalsTxsAndPutInState = _state =>
  new Promise(resolve => {
    logger.info('Building proposals txs...')
    const detectedEvents = _state[STATE_DETECTED_DB_REPORTS_KEY]
    const destinationChainId = _state[constants.state.STATE_KEY_CHAIN_ID]
    const providerUrl = _state[constants.state.STATE_KEY_PROVIDER_URL]
    const identityGpgFile = _state[constants.state.STATE_KEY_IDENTITY_FILE]
    const managerAddress =
      _state[constants.state.STATE_KEY_STATE_MANAGER_ADDRESS]
    const txTimeout = _state[constants.state.STATE_KEY_TX_TIMEOUT]
    const provider = new ethers.providers.JsonRpcProvider(providerUrl)

    return (
      checkEventsHaveExpectedDestinationChainId(
        destinationChainId,
        detectedEvents
      )
        // FIXME: use gpg decrypt
        .then(_ => readFile(identityGpgFile, { encoding: 'utf8' }))
        .then(_privateKey => new ethers.Wallet(_privateKey, provider))
        .then(
          sendProposalTransactions(detectedEvents, managerAddress, txTimeout)
        )
        .then(addProposalsReportsToState(_state))
        .then(resolve)
    )
  })

const maybeBuildProposalsTxsAndPutInState = _state =>
  new Promise(resolve => {
    logger.info('Maybe building proposals txs...')
    const detectedEvents = _state[STATE_DETECTED_DB_REPORTS_KEY]
    const detectedEventsNumber = length(detectedEvents)

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
