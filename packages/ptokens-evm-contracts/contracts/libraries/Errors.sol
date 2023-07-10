// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {IPNetworkHub} from "../interfaces/IPNetworkHub.sol";

library Errors {
    error OperationAlreadyQueued(IPNetworkHub.Operation operation);
    error OperationAlreadyExecuted(IPNetworkHub.Operation operation);
    error OperationAlreadyCancelled(IPNetworkHub.Operation operation);
    error OperationCancelled(IPNetworkHub.Operation operation);
    error OperationNotQueued(IPNetworkHub.Operation operation);
    error GovernanceOperationAlreadyCancelled(IPNetworkHub.Operation operation);
    error GuardianOperationAlreadyCancelled(IPNetworkHub.Operation operation);
    error SentinelOperationAlreadyCancelled(IPNetworkHub.Operation operation);
    error ChallengePeriodNotTerminated(uint64 startTimestamp, uint64 endTimestamp);
    error ChallengePeriodTerminated(uint64 startTimestamp, uint64 endTimestamp);
    error InvalidUnderlyingAssetName(string underlyingAssetName, string expectedUnderlyingAssetName);
    error InvalidUnderlyingAssetSymbol(string underlyingAssetSymbol, string expectedUnderlyingAssetSymbol);
    error InvalidUnderlyingAssetDecimals(uint256 underlyingAssetDecimals, uint256 expectedUnderlyingAssetDecimals);
    error InvalidAssetParameters(uint256 assetAmount, address assetTokenAddress);
    error SenderIsNotHub();
    error InvalidUserOperation();
    error NoUserOperation();
    error PTokenNotCreated(address pTokenAddress);
    error InvalidNetwork(bytes4 networkId);
    error NotContract(address addr);
    error LockDown();
    error InvalidGovernanceStateReader(address expectedGovernanceStateReader, address governanceStateReader);
    error InvalidTopic(bytes32 expectedTopic, bytes32 topic);
    error InvalidReceiptsRootMerkleProof();
    error InvalidRootHashMerkleProof();
    error InvalidHeaderBlock();
    error NotRouter(address sender, address router);
    error InvalidAmount(uint256 amount, uint256 expectedAmount);
    error InvalidSourceChainId(uint32 sourceChainId, uint32 expectedSourceChainId);
    error InvalidGovernanceMessageVerifier(
        address governanceMessagerVerifier,
        address expectedGovernanceMessageVerifier
    );
    error InvalidSentinelRegistration(bytes1 kind);
    error InvalidGovernanceMessage(bytes message);
    error InvalidLockedAmountChallengePeriod(
        uint256 lockedAmountChallengePeriod,
        uint256 expectedLockedAmountChallengePeriod
    );
    error CallFailed();
    error QueueFull();
}
