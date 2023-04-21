// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {IStateManager} from "../interfaces/IStateManager.sol";

library Errors {
    error OperationAlreadyQueued(IStateManager.Operation operation);
    error OperationAlreadyExecuted(IStateManager.Operation operation);
    error OperationAlreadyCancelled(IStateManager.Operation operation);
    error OperationCancelled(IStateManager.Operation operation);
    error OperationNotQueued(IStateManager.Operation operation);
    error GovernanceOperationAlreadyCancelled(IStateManager.Operation operation);
    error GuardianOperationAlreadyCancelled(IStateManager.Operation operation);
    error SentinelOperationAlreadyCancelled(IStateManager.Operation operation);
    error ChallengePeriodNotTerminated(uint64 startTimestamp, uint64 endTimestamp);
    error ChallengePeriodTerminated(uint64 startTimestamp, uint64 endTimestamp);
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
    error Paused();
}
