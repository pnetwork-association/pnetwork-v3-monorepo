const ethers = require('ethers')
const { readFile } = require('fs/promises')
const constants = require('ptokens-constants')
const schemas = require('ptokens-schemas')
const { logger } = require('../get-logger')
const { errors, logic } = require('ptokens-utils')
const { ERROR_INVALID_EVENT_NAME } = require('../errors')
const { curry, prop, values, includes, length } = require('ramda')
const { addProposalsReportsToState } = require('../state/state-operations.js')
const { STATE_DETECTED_DB_REPORTS_KEY } = require('../state/constants')
const {
  checkEventsHaveExpectedDestinationChainId,
} = require('../check-events-have-expected-chain-id')
const { callContractFunctionAndAwait } = require('./evm-call-contract-function')

const ABI_QUEUE_OPERATION = [
  'function protocolQueueOperation(tuple(' +
    'bytes32 originBlockHash, ' +
    'bytes32 originTransactionHash, ' +
    'bytes32 optionsMask, ' +
    'uint256 nonce, ' +
    'uint256 underlyingAssetDecimals, ' +
    'uint256 amount, ' +
    'address underlyingAssetTokenAddress, ' +
    'bytes4 originNetworkId, ' +
    'bytes4 destinationNetworkId, ' +
    'bytes4 underlyingAssetNetworkId, ' +
    'string destinationAccount, ' +
    'string underlyingAssetName, ' +
    'string underlyingAssetSymbol, ' +
    'bytes userData, ' +
    ') calldata operation)',
  'error OperationAlreadyProcessed(bytes32 operationId)',
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
      const amount = _eventReport[schemas.constants.SCHEMA_ASSET_AMOUNT_KEY]
      const userData = _eventReport[schemas.constants.SCHEMA_USER_DATA_KEY]
      const eventName = _eventReport[schemas.constants.SCHEMA_EVENT_NAME_KEY]
      const originChainId =
        _eventReport[schemas.constants.SCHEMA_ORIGINATING_NETWORK_ID_KEY]
      const originBlockHash =
        _eventReport[schemas.constants.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]
      const originatingTxHash =
        _eventReport[schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]
      const destinationAddress =
        _eventReport[schemas.constants.SCHEMA_DESTINATION_ACCOUNT_KEY]
      const destinationNetworkId =
        _eventReport[schemas.constants.SCHEMA_DESTINATION_NETWORK_ID_KEY]
      const underlyingAssetName =
        _eventReport[schemas.constants.SCHEMA_UNDERLYING_ASSET_NAME_KEY]
      const underlyingAssetSymbol =
        _eventReport[schemas.constants.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]
      const underlyingAssetDecimals =
        _eventReport[schemas.constants.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]
      const underlyingAssetNetworkId =
        _eventReport[schemas.constants.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]
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
        [
          originBlockHash,
          originatingTxHash,
          optionsMask,
          nonce,
          underlyingAssetDecimals,
          amount,
          underlyingAssetTokenAddress,
          originChainId,
          destinationNetworkId,
          underlyingAssetNetworkId,
          destinationAddress,
          underlyingAssetName,
          underlyingAssetSymbol,
          userData,
        ],
      ]
      const functionName = 'protocolQueueOperation'
      const contract = new ethers.Contract(_managerContract, abi, _wallet)

      logger.info(`Executing _id: ${id}`)
      logger.info('function protocolQueueOperation([')
      logger.info(`  bytes32 originBlockHash: ${originBlockHash}`)
      logger.info(`  bytes32 originTransactionHash: ${originatingTxHash}`)
      logger.info(`  bytes32 optionsMask: ${optionsMask}`)
      logger.info(`  uint256 nonce: ${nonce}`)
      logger.info(
        `  uint256 underlyingAssetDecimals: ${underlyingAssetDecimals}`
      )
      logger.info(`  uint256 amount: ${amount}`)
      logger.info(
        `  address underlyingAssetTokenAddress: ${underlyingAssetTokenAddress}`
      )
      logger.info(`  bytes4 originNetworkId: ${originChainId}`)
      logger.info(`  bytes4 destinationNetworkId: ${destinationNetworkId}`)
      logger.info(
        `  bytes4 underlyingAssetNetworkId: ${underlyingAssetNetworkId}`
      )
      logger.info(`  address destinationAccount: ${destinationAddress}`)
      logger.info(
        `  string calldata:  underlyingAssetName ${underlyingAssetName}`
      )
      logger.info(
        `  string calldata:  underlyingAssetSymbol ${underlyingAssetSymbol}`
      )
      logger.info(`  bytes calldata:  userData ${userData}`)
      logger.info('])')

      return callContractFunctionAndAwait(
        functionName,
        args,
        contract,
        _txTimeout
      )
        .then(prop('hash')) // TODO: store in a constant
        .then(addProposedTxHashToEvent(_eventReport))
        .then(resolve)
        .catch(_err => {
          if (_err.message.includes(errors.ERROR_TIMEOUT)) {
            logger.error(`Tx for ${originatingTxHash} failed:`, _err.message)
            return resolve(_eventReport)
          } else if (
            _err.message.includes(errors.ERROR_OPERATION_ALREADY_PROCESSED)
          ) {
            logger.error(
              `Tx for ${originatingTxHash} has already been proposed`
            )
            return resolve(addProposedTxHashToEvent(_eventReport, '0x'))
          } else {
            return reject(_err)
          }
        })
    })
)

const sendProposalTransactions = curry(
  (_eventReports, _manager, _timeOut, _wallet) =>
    logger.info(`Sending proposals w/ address ${_wallet.address}`) ||
    Promise.all(
      _eventReports.map((_eventReport, _i) =>
        logic
          .sleepForXMilliseconds(1000 * _i)
          .then(_ =>
            makeProposalContractCall(_wallet, _manager, _timeOut, _eventReport)
          )
      )
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
    const provider = new ethers.JsonRpcProvider(providerUrl)

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
