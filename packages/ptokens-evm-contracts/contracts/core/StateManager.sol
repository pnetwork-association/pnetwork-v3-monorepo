// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {IPRouter} from "../interfaces/IPRouter.sol";
import {IPToken} from "../interfaces/IPToken.sol";
import {IPFactory} from "../interfaces/IPFactory.sol";
import {IStateManager} from "../interfaces/IStateManager.sol";
import {Roles} from "../libraries/Roles.sol";
import {Errors} from "../libraries/Errors.sol";
import {Constants} from "../libraries/Constants.sol";
import {Utils} from "../libraries/Utils.sol";

contract StateManager is IStateManager, Context, ReentrancyGuard {
    mapping(bytes32 => OperationData) private _operationsData;

    address public immutable factory;
    uint32 public immutable queueTime;

    constructor(address _factory, uint32 _queueTime) {
        factory = _factory;
        queueTime = _queueTime;
    }

    function operationIdOf(Operation memory operation) public pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    operation.originBlockHash,
                    operation.originTransactionHash,
                    operation.originNetworkId,
                    operation.nonce,
                    operation.destinationAccount,
                    operation.destinationNetworkId,
                    operation.underlyingAssetName,
                    operation.underlyingAssetSymbol,
                    operation.underlyingAssetDecimals,
                    operation.underlyingAssetTokenAddress,
                    operation.underlyingAssetNetworkId,
                    operation.amount,
                    operation.userData,
                    operation.optionsMask
                )
            );
    }

    function protocolCancelOperation(Operation calldata operation) external {
        bytes32 operationId = operationIdOf(operation);

        OperationData storage operationData = _operationsData[operationId];

        if (operationData.status != Constants.OPERATION_QUEUED) {
            revert Errors.OperationNotQueued(operationId);
        }

        operationData.status = Constants.OPERATION_CANCELLED;
        emit OperationCancelled(operation);
    }

    function protocolExecuteOperation(Operation calldata operation) external nonReentrant {
        bytes32 operationId = operationIdOf(operation);

        OperationData storage operationData = _operationsData[operationId];
        bytes1 operationStatus = operationData.status;
        if (operationStatus == Constants.OPERATION_EXECUTED) {
            revert Errors.OperationAlreadyExecuted(operationId);
        }
        if (operationStatus == Constants.OPERATION_CANCELLED) {
            revert Errors.OperationCancelled(operationId);
        }
        if (operationStatus != Constants.OPERATION_QUEUED) {
            revert Errors.OperationNotQueued(operationId);
        }

        uint64 executeTimestamp = operationData.executeTimestamp;
        if (uint64(block.timestamp) < executeTimestamp) {
            revert Errors.ExecuteTimestampNotReached(executeTimestamp);
        }

        if (operation.amount > 0) {
            address pTokenAddress = IPFactory(factory).getPTokenAddress(
                operation.underlyingAssetName,
                operation.underlyingAssetSymbol,
                operation.underlyingAssetDecimals,
                operation.underlyingAssetTokenAddress,
                operation.underlyingAssetNetworkId
            );

            address destinationAddress = Utils.parseAddress(operation.destinationAccount);
            IPToken(pTokenAddress).stateManagedProtocolMint(destinationAddress, operation.amount);

            if (Utils.isBitSet(operation.optionsMask, 1)) {
                if (!Utils.isCurrentNetwork(operation.underlyingAssetNetworkId)) {
                    revert Errors.InvalidNetwork(operation.underlyingAssetNetworkId);
                }
                IPToken(pTokenAddress).stateManagedProtocolBurn(destinationAddress, operation.amount);
            }
        }

        if (operation.userData.length > 0) {
            /*
            try {
                (destinationAccount)._receiveUserData(userData)
            } catch() {}  
            */
        }

        operationData.status = Constants.OPERATION_EXECUTED;

        emit OperationExecuted(operation);
    }

    function protocolQueueOperation(Operation calldata operation) external {
        _queueOperation(_msgSender(), operation);
    }

    function _queueOperation(address relayer, Operation calldata operation) internal {
        bytes32 operationId = operationIdOf(operation);

        if (_operationsData[operationId].status != Constants.OPERATION_NULL) {
            revert Errors.OperationAlreadyQueued(operationId);
        }

        _operationsData[operationId] = OperationData(
            relayer,
            uint64(block.timestamp + queueTime),
            Constants.OPERATION_QUEUED
        );

        emit OperationQueued(operation);
    }
}
