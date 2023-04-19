// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IEpochsManager} from "@pnetwork/dao-v2-contracts/contracts/interfaces/IEpochsManager.sol";
import {IPRouter} from "../interfaces/IPRouter.sol";
import {IPToken} from "../interfaces/IPToken.sol";
import {IPFactory} from "../interfaces/IPFactory.sol";
import {IStateManager} from "../interfaces/IStateManager.sol";
import {IPReceiver} from "../interfaces/IPReceiver.sol";
import {Roles} from "../libraries/Roles.sol";
import {Errors} from "../libraries/Errors.sol";
import {Constants} from "../libraries/Constants.sol";
import {Utils} from "../libraries/Utils.sol";
import {Network} from "../libraries/Network.sol";

contract StateManager is IStateManager, Context, ReentrancyGuard {
    mapping(bytes32 => Action) private _operationsRelayerQueueAction;
    mapping(bytes32 => Action) private _operationsGovernanceCancelAction;
    mapping(bytes32 => Action) private _operationsGuardianCancelAction;
    mapping(bytes32 => Action) private _operationsSentinelCancelAction;
    mapping(bytes32 => Action) private _operationsExecuteAction;
    mapping(bytes32 => uint8) private _operationsTotalCancelActions;
    mapping(bytes32 => bytes1) private _operationsStatus;

    address public immutable factory;
    address public immutable epochsManager;
    uint32 private immutable _baseChallengePeriodDuration;

    modifier onlySentinel(
        Operation calldata operation,
        bytes calldata proof,
        string memory action
    ) {
        // TODO: check if msg.sender is a sentinel
        address sentinel = ECDSA.recover(sha256(abi.encode(action, operationIdOf(operation))), proof);
        _;
    }

    modifier onlyGuardian(string memory action) {
        // TODO: check if msg.sender is a guardian
        _;
    }

    modifier onlyGovernance(bytes calldata proof, string memory action) {
        // TODO: check if msg.sender is a governance
        _;
    }

    modifier onlyFarFromClosingAndOpeningEpoch() {
        uint256 currentEpoch = IEpochsManager(epochsManager).currentEpoch();
        uint256 epochDuration = IEpochsManager(epochsManager).epochDuration();
        uint256 startFirstEpochTimestamp = IEpochsManager(epochsManager).startFirstEpochTimestamp();

        uint256 currentEpochStartTimestamp = startFirstEpochTimestamp + (currentEpoch * epochDuration);
        uint256 currentEpochEndTimestamp = startFirstEpochTimestamp + ((currentEpoch + 1) * epochDuration);

        if (
            block.timestamp <= currentEpochStartTimestamp + 3600 || block.timestamp >= currentEpochEndTimestamp - 3600
        ) {
            revert Errors.Paused();
        }
        _;
    }

    constructor(address factory_, address epochsManager_, uint32 baseChallengePeriodDuration) {
        factory = factory_;
        epochsManager = epochsManager_;
        _baseChallengePeriodDuration = baseChallengePeriodDuration;
    }

    /// @inheritdoc IStateManager
    function challengePeriodOf(Operation calldata operation) external view returns (uint64, uint64) {
        bytes32 operationId = operationIdOf(operation);
        bytes1 operationStatus = _operationsStatus[operationId];
        return _challengePeriodOf(operationId, operationStatus);
    }

    /// @inheritdoc IStateManager
    function operationIdOf(Operation calldata operation) public pure returns (bytes32) {
        return
            sha256(
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
                    operation.assetAmount,
                    operation.userData,
                    operation.optionsMask
                )
            );
    }

    /// @inheritdoc IStateManager
    function protocolGuardianCancelOperation(
        Operation calldata operation
    ) external onlyFarFromClosingAndOpeningEpoch onlyGuardian("cancel") {
        _protocolCancelOperation(operation, Actor.Guardian);
    }

    /// @inheritdoc IStateManager
    function protocolGovernanceCancelOperation(
        Operation calldata operation,
        bytes calldata proof
    ) external onlyGovernance(proof, "cancel") {
        _protocolCancelOperation(operation, Actor.Governance);
    }

    /// @inheritdoc IStateManager
    function protocolSentinelCancelOperation(
        Operation calldata operation,
        bytes calldata proof
    ) external onlyFarFromClosingAndOpeningEpoch onlySentinel(operation, proof, "cancel") {
        _protocolCancelOperation(operation, Actor.Sentinel);
    }

    /// @inheritdoc IStateManager
    function protocolExecuteOperation(
        Operation calldata operation
    ) external onlyFarFromClosingAndOpeningEpoch nonReentrant {
        bytes32 operationId = operationIdOf(operation);

        bytes1 operationStatus = _operationsStatus[operationId];
        if (operationStatus == Constants.OPERATION_EXECUTED) {
            revert Errors.OperationAlreadyExecuted(operation);
        } else if (operationStatus == Constants.OPERATION_CANCELLED) {
            revert Errors.OperationAlreadyCancelled(operation);
        } else if (operationStatus == Constants.OPERATION_NULL) {
            revert Errors.OperationNotQueued(operation);
        }
        if (operationStatus != Constants.OPERATION_QUEUED) {
            revert Errors.OperationNotQueued(operation);
        }

        (uint64 startTimestamp, uint64 endTimestamp) = _challengePeriodOf(operationId, operationStatus);
        if (uint64(block.timestamp) < endTimestamp) {
            revert Errors.ChallengePeriodNotTerminated(startTimestamp, endTimestamp);
        }

        address destinationAddress = Utils.parseAddress(operation.destinationAccount);
        if (operation.assetAmount > 0) {
            address pTokenAddress = IPFactory(factory).getPTokenAddress(
                operation.underlyingAssetName,
                operation.underlyingAssetSymbol,
                operation.underlyingAssetDecimals,
                operation.underlyingAssetTokenAddress,
                operation.underlyingAssetNetworkId
            );
            IPToken(pTokenAddress).stateManagedProtocolMint(destinationAddress, operation.assetAmount);

            if (Utils.isBitSet(operation.optionsMask, 0)) {
                if (!Network.isCurrentNetwork(operation.underlyingAssetNetworkId)) {
                    revert Errors.InvalidNetwork(operation.underlyingAssetNetworkId);
                }
                IPToken(pTokenAddress).stateManagedProtocolBurn(destinationAddress, operation.assetAmount);
            }
        }

        if (operation.userData.length > 0) {
            if (destinationAddress.code.length == 0) revert Errors.NotContract(destinationAddress);
            try IPReceiver(destinationAddress).receiveUserData(operation.userData) {} catch {}
        }

        _operationsStatus[operationId] = Constants.OPERATION_EXECUTED;
        _operationsExecuteAction[operationId] = Action(_msgSender(), uint64(block.timestamp));
        emit OperationExecuted(operation);
    }

    /// @inheritdoc IStateManager
    function protocolQueueOperation(Operation calldata operation) external onlyFarFromClosingAndOpeningEpoch {
        bytes32 operationId = operationIdOf(operation);

        bytes1 operationStatus = _operationsStatus[operationId];
        if (operationStatus == Constants.OPERATION_EXECUTED) {
            revert Errors.OperationAlreadyExecuted(operation);
        } else if (operationStatus == Constants.OPERATION_CANCELLED) {
            revert Errors.OperationAlreadyCancelled(operation);
        } else if (operationStatus == Constants.OPERATION_QUEUED) {
            revert Errors.OperationAlreadyQueued(operation);
        }

        _operationsRelayerQueueAction[operationId] = Action(_msgSender(), uint64(block.timestamp));
        _operationsStatus[operationId] = Constants.OPERATION_QUEUED;

        emit OperationQueued(operation);
    }

    function _challengePeriodOf(bytes32 operationId, bytes1 operationStatus) internal view returns (uint64, uint64) {
        // TODO: What is the challenge period of an already executed/cancelled operation
        if (operationStatus != Constants.OPERATION_QUEUED) return (0, 0);

        Action storage queueAction = _operationsRelayerQueueAction[operationId];
        // NOTE: no need to check if queueAction valid since if operationStatus = Constants.OPERATION_QUEUED we are sure that is valid
        uint64 startTimestamp = queueAction.timestamp;
        uint64 endTimestamp = startTimestamp + _baseChallengePeriodDuration;
        if (_operationsTotalCancelActions[operationId] == 0) {
            return (startTimestamp, endTimestamp);
        }

        // TODO: Is it usefull to check _operationsGovernanceCancelAction? if _operationsTotalCancelActions = 1 it's impossible that
        // the cancellation action comes from the governance since a vote lasts more than baseChallengePeriodDuration
        // if _operationsTotalCancelActions = 2 the _challengePeriodOf is useless since 2 means that the operation must be cancelled.abi
        /*if (_operationsGovernanceCancelAction[operationId].actor != address(0)) {
            endTimestamp += 432000; // +5days
        }*/

        // NOTE: Is the increasing value equal for both actors? if it is we can avoid to read from storage and just endTimestamp += _operationsTotalCancelActions * 432000
        if (_operationsGuardianCancelAction[operationId].actor != address(0)) {
            endTimestamp += 432000; // +5days
        }

        if (_operationsSentinelCancelAction[operationId].actor != address(0)) {
            endTimestamp += 432000; // +5days
        }

        return (startTimestamp, endTimestamp);
    }

    function _protocolCancelOperation(Operation calldata operation, Actor actor) internal {
        bytes32 operationId = operationIdOf(operation);

        bytes1 operationStatus = _operationsStatus[operationId];
        if (operationStatus == Constants.OPERATION_EXECUTED) {
            revert Errors.OperationAlreadyExecuted(operation);
        } else if (operationStatus == Constants.OPERATION_CANCELLED) {
            revert Errors.OperationAlreadyCancelled(operation);
        } else if (operationStatus == Constants.OPERATION_NULL) {
            revert Errors.OperationNotQueued(operation);
        }

        (uint64 startTimestamp, uint64 endTimestamp) = _challengePeriodOf(operationId, operationStatus);
        if (uint64(block.timestamp) >= endTimestamp) {
            revert Errors.ChallengePeriodTerminated(startTimestamp, endTimestamp);
        }

        Action memory action = Action(_msgSender(), uint64(block.timestamp));
        if (actor == Actor.Governance) {
            if (_operationsGovernanceCancelAction[operationId].actor != address(0)) {
                revert Errors.GovernanceOperationAlreadyCancelled(operation);
            }

            _operationsGovernanceCancelAction[operationId];
            emit GovernanceOperationCancelled(operation);
        }
        if (actor == Actor.Guardian) {
            if (_operationsGuardianCancelAction[operationId].actor != address(0)) {
                revert Errors.GuardianOperationAlreadyCancelled(operation);
            }

            _operationsGuardianCancelAction[operationId] = action;
            emit GuardianOperationCancelled(operation);
        }
        if (actor == Actor.Sentinel) {
            if (_operationsSentinelCancelAction[operationId].actor != address(0)) {
                revert Errors.SentinelOperationAlreadyCancelled(operation);
            }

            _operationsSentinelCancelAction[operationId] = action;
            emit SentinelOperationCancelled(operation);
        }

        unchecked {
            ++_operationsTotalCancelActions[operationId];
        }
        if (_operationsTotalCancelActions[operationId] == 2) {
            _operationsStatus[operationId] = Constants.OPERATION_CANCELLED;
            emit OperationCancelled(operation);
        }
    }
}
