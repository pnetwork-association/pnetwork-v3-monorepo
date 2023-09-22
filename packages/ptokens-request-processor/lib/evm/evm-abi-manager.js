const { logger } = require('../get-logger')
const constants = require('ptokens-constants')
const PNetworkHubAbi = require('./abi/PNetworkHub').abi

const getProtocolOperationAbi = () => PNetworkHubAbi

const getProtocolGuardianCancelOperationAbi = () => PNetworkHubAbi

const getOperationStatusOfAbi = () => PNetworkHubAbi

const getChallengePeriodOfAbi = () => PNetworkHubAbi

const logUserOperationFromAbiArgs = (_operationName, _args) => {
  logger.info(`function ${_operationName}([`)
  logger.info(`  bytes32 originBlockHash' ${_args[0][0]}`)
  logger.info(`  bytes32 originTransactionHash' ${_args[0][1]}`)
  logger.info(`  bytes32 optionsMask' ${_args[0][2]}`)
  logger.info(`  uint256 nonce' ${_args[0][3]}`)
  logger.info(`  uint256 underlyingAssetDecimals' ${_args[0][4]}`)
  logger.info(`  uint256 assetAmount' ${_args[0][5]}`)
  logger.info(`  uint256 protocolFeeAssetAmount' ${_args[0][6]}`)
  logger.info(`  uint256 networkFeeAssetAmount' ${_args[0][7]}`)
  logger.info(`  uint256 forwardNetworkFeeAssetAmount' ${_args[0][8]}`)
  logger.info(`  address underlyingAssetTokenAddress' ${_args[0][9]}`)
  logger.info(`  bytes4 originNetworkId' ${_args[0][10]}`)
  logger.info(`  bytes4 destinationNetworkId' ${_args[0][11]}`)
  logger.info(`  bytes4 forwardDestinationNetworkId' ${_args[0][12]}`)
  logger.info(`  bytes4 underlyingAssetNetworkId' ${_args[0][13]}`)
  logger.info(`  string destinationAccount' ${_args[0][14]}`)
  logger.info(`  string originAccount' ${_args[0][15]}`)
  logger.info(`  string underlyingAssetName' ${_args[0][16]}`)
  logger.info(`  string underlyingAssetSymbol' ${_args[0][17]}`)
  logger.info(`  bytes userData' ${_args[0][18]}`)
  logger.info(`  bool isForProtocol ${_args[0][19]}`)
  logger.info('])')
}

const getLockedAmountChallengePeriodAbi = () => PNetworkHubAbi

const getProtocolQueueOperationAbi = () => getProtocolOperationAbi('protocolQueueOperation')
const getProtocolExecuteOperationAbi = () => getProtocolOperationAbi('protocolExecuteOperation')

const getUserOperationAbiArgsFromReport = _eventReport => [
  [
    _eventReport[constants.db.KEY_ORIGINATING_BLOCK_HASH] ||
      _eventReport[constants.db.KEY_BLOCK_HASH],
    _eventReport[constants.db.KEY_ORIGINATING_TX_HASH] || _eventReport[constants.db.KEY_TX_HASH],
    _eventReport[constants.db.KEY_OPTIONS_MASK],
    _eventReport[constants.db.KEY_NONCE],
    _eventReport[constants.db.KEY_UNDERLYING_ASSET_DECIMALS],
    _eventReport[constants.db.KEY_ASSET_AMOUNT],
    _eventReport[constants.db.KEY_PROTOCOL_FEE_ASSET_AMOUNT],
    _eventReport[constants.db.KEY_NETWORK_FEE_ASSET_AMOUNT],
    _eventReport[constants.db.KEY_FORWARD_NETWORK_FEE_ASSET_AMOUNT],
    _eventReport[constants.db.KEY_UNDERLYING_ASSET_TOKEN_ADDRESS],
    _eventReport[constants.db.KEY_ORIGINATING_NETWORK_ID] ||
      _eventReport[constants.db.KEY_NETWORK_ID],
    _eventReport[constants.db.KEY_DESTINATION_NETWORK_ID],
    _eventReport[constants.db.KEY_FORWARD_DESTINATION_NETWORK_ID],
    _eventReport[constants.db.KEY_UNDERLYING_ASSET_NETWORK_ID],
    _eventReport[constants.db.KEY_ORIGINATING_ADDRESS],
    _eventReport[constants.db.KEY_DESTINATION_ACCOUNT],
    _eventReport[constants.db.KEY_UNDERLYING_ASSET_NAME],
    _eventReport[constants.db.KEY_UNDERLYING_ASSET_SYMBOL],
    _eventReport[constants.db.KEY_USER_DATA],
    _eventReport[constants.db.KEY_IS_FOR_PROTOCOL],
  ],
]

const getSolveChallengeGuardianAbi = () => PNetworkHubAbi

module.exports = {
  getOperationStatusOfAbi,
  getChallengePeriodOfAbi,
  logUserOperationFromAbiArgs,
  getProtocolQueueOperationAbi,
  getSolveChallengeGuardianAbi,
  getProtocolExecuteOperationAbi,
  getUserOperationAbiArgsFromReport,
  getLockedAmountChallengePeriodAbi,
  getProtocolGuardianCancelOperationAbi,
}
