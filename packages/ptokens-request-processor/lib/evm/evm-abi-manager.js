const schemas = require('ptokens-schemas')
const { logger } = require('../get-logger')

const userOperationTuple =
  'tuple(' +
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
  ')'

const getProtocolOperationAbi = _operationName => [
  `function ${_operationName}(${userOperationTuple} calldata operation)`,
  'error OperationAlreadyQueued(bytes32 operationId)',
  'error OperationAlreadyExecuted(bytes32 operationId)',
  'error OperationCancelled(bytes32 operationId)',
  'error OperationNotQueued(bytes32 operationId)',
  'error ExecuteTimestampNotReached(uint64 executeTimestamp)',
  'error InvalidUnderlyingAssetName(string underlyingAssetName, string expectedUnderlyingAssetName)',
  'error InvalidUnderlyingAssetSymbol(string underlyingAssetSymbol, string expectedUnderlyingAssetSymbol)',
  'error InvalidUnderlyingAssetDecimals(uint256 underlyingAssetDecimals, uint256 expectedUnderlyingAssetDecimals)',
  'error InvalidAssetParameters(uint256 assetAmount, address assetTokenAddress)',
  'error SenderIsNotRouter()',
  'error SenderIsNotStateManager()',
  'error InvalidUserOperation()',
  'error NoUserOperation()',
  'error PTokenNotCreated(address pTokenAddress)',
  'error InvalidNetwork(bytes4 networkId)',
]

const logUserOperationFromAbiArgs = (_operationName, _args) => {
  logger.info(`function ${_operationName}([`)
  logger.info(`  bytes32 originBlockHash ${_args[0][0]}`)
  logger.info(`  bytes32 originTransactionHash ${_args[0][1]}`)
  logger.info(`  bytes32 optionsMask ${_args[0][2]}`)
  logger.info(`  uint256 nonce ${_args[0][3]}`)
  logger.info(`  uint256 underlyingAssetDecimals ${_args[0][4]}`)
  logger.info(`  uint256 amount ${_args[0][5]}`)
  logger.info(`  address underlyingAssetTokenAddress ${_args[0][6]}`)
  logger.info(`  bytes4 originNetworkId ${_args[0][7]}`)
  logger.info(`  bytes4 destinationNetworkId ${_args[0][8]}`)
  logger.info(`  bytes4 underlyingAssetNetworkId ${_args[0][9]}`)
  logger.info(`  string destinationAccount ${_args[0][10]}`)
  logger.info(`  string underlyingAssetName ${_args[0][11]}`)
  logger.info(`  string underlyingAssetSymbol ${_args[0][12]}`)
  logger.info(`  bytes userData ${_args[0][13]}`)
  logger.info('])')
}

const getProtocolQueueOperationAbi = () =>
  getProtocolOperationAbi('protocolQueueOperation')
const getProtocolExecuteOperationAbi = () =>
  getProtocolOperationAbi('protocolExecuteOperation')
const getProtocolCancelOperationAbi = () =>
  getProtocolOperationAbi('protocolCancelOperation')

const getUserOperationAbiArgsFromReport = _eventReport => [
  [
    _eventReport[schemas.constants.SCHEMA_ORIGINATING_BLOCK_HASH_KEY],
    _eventReport[schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY],
    _eventReport[schemas.constants.SCHEMA_OPTIONS_MASK],
    _eventReport[schemas.constants.SCHEMA_NONCE_KEY],
    _eventReport[schemas.constants.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY],
    _eventReport[schemas.constants.SCHEMA_ASSET_AMOUNT_KEY],
    _eventReport[schemas.constants.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY],
    _eventReport[schemas.constants.SCHEMA_ORIGINATING_NETWORK_ID_KEY],
    _eventReport[schemas.constants.SCHEMA_DESTINATION_NETWORK_ID_KEY],
    _eventReport[schemas.constants.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY],
    _eventReport[schemas.constants.SCHEMA_DESTINATION_ACCOUNT_KEY],
    _eventReport[schemas.constants.SCHEMA_UNDERLYING_ASSET_NAME_KEY],
    _eventReport[schemas.constants.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY],
    _eventReport[schemas.constants.SCHEMA_USER_DATA_KEY],
  ],
]

module.exports = {
  logUserOperationFromAbiArgs,
  getProtocolQueueOperationAbi,
  getProtocolExecuteOperationAbi,
  getProtocolCancelOperationAbi,
  getUserOperationAbiArgsFromReport,
}
