// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {IStateManager} from "../interfaces/IStateManager.sol";

library Errors {
    error OperationAlreadyQueued(IStateManager.Operation operationId);
    error OperationAlreadyExecuted(IStateManager.Operation operationId);
    error OperationCancelled(IStateManager.Operation operationId);
    error OperationNotQueued(IStateManager.Operation operationId);
    error ExecuteTimestampNotReached(uint64 executeTimestamp);
    error ExecuteTimestampAlreadyReached(uint64 executeTimstamp);
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
    error NotContract(address addr);
}
