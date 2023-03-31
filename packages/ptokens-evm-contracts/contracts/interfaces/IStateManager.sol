// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

/**
 * @title IStateManager
 * @author pNetwork
 *
 * @notice
 */
interface IStateManager {
    struct Operation {
        bytes32 originBlockHash;
        bytes32 originTransactionHash;
        bytes32 optionsMask;
        uint256 nonce;
        uint256 underlyingAssetDecimals;
        uint256 amount;
        address underlyingAssetTokenAddress;
        bytes4 originNetworkId;
        bytes4 destinationNetworkId;
        bytes4 underlyingAssetNetworkId;
        string destinationAccount;
        string underlyingAssetName;
        string underlyingAssetSymbol;
        bytes userData;
    }

    struct OperationData {
        address relayer;
        uint64 executeTimestamp;
        bytes1 status;
    }

    event OperationQueued(Operation operation);

    event OperationExecuted(Operation operation);

    event OperationCancelled(Operation operation);
}
