const OPERATION_TUPLE =
  'tuple(bytes32 originBlockHash, bytes32 originTransactionHash, bytes32 optionsMask, uint256 nonce, uint256 underlyingAssetDecimals, uint256 assetAmount, uint256 protocolFeeAssetAmount, uint256 networkFeeAssetAmount, uint256 forwardNetworkFeeAssetAmount, address underlyingAssetTokenAddress, bytes4 originNetworkId, bytes4 destinationNetworkId, bytes4 forwardDestinationNetworkId, bytes4 underlyingAssetNetworkId, string originAccount, string destinationAccount, string underlyingAssetName, string underlyingAssetSymbol, bytes userData, bool isForProtocol)'

const OPERATION_CANCELLED_SIGNATURE = `OperationCancelFinalized(${OPERATION_TUPLE} operation)`

const OPERATION_EXECUTED_SIGNATURE = `OperationExecuted(${OPERATION_TUPLE} operation)`

const OPERATION_QUEUED_SIGNATURE = `OperationQueued(${OPERATION_TUPLE} operation)`

const USER_OPERATION_SIGNATURE =
  'UserOperation(uint256 nonce, string originAccount, string destinationAccount, bytes4 destinationNetworkId, string underlyingAssetName, string underlyingAssetSymbol, uint256 underlyingAssetDecimals, address underlyingAssetTokenAddress, bytes4 underlyingAssetNetworkId, address assetTokenAddress, uint256 assetAmount, address protocolFeeAssetTokenAddress, uint256 protocolFeeAssetAmount, uint256 networkFeeAssetAmount, uint256 forwardNetworkFeeAssetAmount, bytes4 forwardDestinationNetworkId, bytes userData, bytes32 optionsMask, bool isForProtocol)'

module.exports = {
  OPERATION_TUPLE,
  OPERATION_CANCELLED_SIGNATURE,
  OPERATION_EXECUTED_SIGNATURE,
  OPERATION_QUEUED_SIGNATURE,
  USER_OPERATION_SIGNATURE,
}
