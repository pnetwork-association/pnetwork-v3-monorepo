const OPERATION_CANCELLED_SIGNATURE =
  'OperationCancelled(tuple(bytes32 originBlockHash, bytes32 originTransactionHash, bytes32 optionsMask, uint256 nonce, uint256 underlyingAssetDecimals, uint256 amount, address underlyingAssetTokenAddress, bytes4 originNetworkId, bytes4 destinationNetworkId, bytes4 underlyingAssetNetworkId, string destinationAccount, string underlyingAssetName, string underlyingAssetSymbol, bytes userData) operation)'

const OPERATION_EXECUTED_SIGNATURE =
  'OperationExecuted(tuple(bytes32 originBlockHash, bytes32 originTransactionHash, bytes32 optionsMask, uint256 nonce, uint256 underlyingAssetDecimals, uint256 amount, address underlyingAssetTokenAddress, bytes4 originNetworkId, bytes4 destinationNetworkId, bytes4 underlyingAssetNetworkId, string destinationAccount, string underlyingAssetName, string underlyingAssetSymbol, bytes userData) operation)'

const OPERATION_QUEUED_SIGNATURE =
  'OperationQueued(tuple(bytes32 originBlockHash, bytes32 originTransactionHash, bytes32 optionsMask, uint256 nonce, uint256 underlyingAssetDecimals, uint256 amount, address underlyingAssetTokenAddress, bytes4 originNetworkId, bytes4 destinationNetworkId, bytes4 underlyingAssetNetworkId, string destinationAccount, string underlyingAssetName, string underlyingAssetSymbol, bytes userData) operation)'

const USER_OPERATION_SIGNATURE =
  'UserOperation(uint256 nonce,string destinationAccount,bytes4 destinationNetworkId,string underlyingAssetName,string underlyingAssetSymbol,uint256 underlyingAssetDecimals,address underlyingAssetTokenAddress,bytes4 underlyingAssetNetworkId,address assetTokenAddress,uint256 assetAmount,bytes userData,bytes32 optionsMask)'

module.exports = {
  OPERATION_CANCELLED_SIGNATURE,
  OPERATION_EXECUTED_SIGNATURE,
  OPERATION_QUEUED_SIGNATURE,
  USER_OPERATION_SIGNATURE,
}
