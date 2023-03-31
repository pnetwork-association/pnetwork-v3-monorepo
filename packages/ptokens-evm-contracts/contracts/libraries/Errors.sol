// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

library Errors {
    error OperationAlreadyQueued(bytes32 operationId);
    error OperationAlreadyExecuted(bytes32 operationId);
    error OperationCancelled(bytes32 operationId);
    error OperationNotQueued(bytes32 operationId);
    error ExecuteTimestampNotReached(uint64 executeTimestamp);
    error InvalidUnderlyingAssetName(string underlyingAssetName, string expectedUnderlyingAssetName);
    error InvalidUnderlyingAssetSymbol(string underlyingAssetSymbol, string expectedUnderlyingAssetSymbol);
    error InvalidUnderlyingAssetDecimals(uint256 underlyingAssetDecimals, uint256 expectedUnderlyingAssetDecimals);
    error InvalidAssetParameters(uint256 assetAmount, address assetTokenAddress);
    error SenderIsNotRouter();
    error SenderIsNotStateManager();
    error InvalidUserOperation();
    error NoUserOperation();
    error PTokenNotCreated(address pTokenAddress);
    error InvalidNetwork(bytes4 networkId);
}
