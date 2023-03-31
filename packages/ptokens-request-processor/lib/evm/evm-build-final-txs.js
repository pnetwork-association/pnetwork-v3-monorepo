const ethers = require('ethers')
const schemas = require('ptokens-schemas')
const constants = require('ptokens-constants')
const { logger } = require('../get-logger')
const { readFile } = require('fs/promises')
const { errors, logic } = require('ptokens-utils')
const { ERROR_INVALID_EVENT_NAME } = require('../errors')
const { curry, values, includes, length, prop } = require('ramda')
const { addFinalizedEventsToState } = require('../state/state-operations.js')
const { STATE_PROPOSED_DB_REPORTS_KEY } = require('../state/constants')
const {
  checkEventsHaveExpectedDestinationChainId,
} = require('../check-events-have-expected-chain-id')
const { callContractFunctionAndAwait } = require('./evm-call-contract-function')

const ABI_EXECUTE_OPERATION = [
  'function protocolExecuteOperation(tuple(' +
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
  (_wallet, _stateManager, _txTimeout, _eventReport) =>
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

      const abi = ABI_EXECUTE_OPERATION
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

      const contractAddress = _stateManager
      const functionName = 'protocolExecuteOperation'
      const contract = new ethers.Contract(contractAddress, abi, _wallet)

      logger.info(`Executing _id: ${id}`)
      logger.info('function protocolExecuteOperation([')
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
        .then(addFinalizedTxHashToEvent(_eventReport))
        .then(resolve)
        .catch(_err => {
          if (_err.message.includes(errors.ERROR_TIMEOUT)) {
            logger.error(`Tx for ${originatingTxHash} failed:`, _err.message)
            return resolve(_eventReport)
          } else if (
            _err.message.includes(errors.ERROR_OPERATION_ALREADY_PROCESSED)
          ) {
            logger.error(
              `Tx for ${originatingTxHash} has already been finalized`
            )
            return resolve(addFinalizedTxHashToEvent(_eventReport, '0x'))
          } else {
            return reject(_err)
          }
        })
    })
)

const sendFinalTransactions = curry(
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
    const destinationChainId = _state[constants.state.STATE_KEY_CHAIN_ID]
    const providerUrl = _state[constants.state.STATE_KEY_PROVIDER_URL]
    const identityGpgFile = _state[constants.state.STATE_KEY_IDENTITY_FILE]
    const provider = new ethers.JsonRpcProvider(providerUrl)
    const txTimeout = _state[schemas.constants.SCHEMA_TX_TIMEOUT]
    const stateManager = _state[constants.state.STATE_KEY_STATE_MANAGER_ADDRESS]

    return (
      checkEventsHaveExpectedDestinationChainId(
        destinationChainId,
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
