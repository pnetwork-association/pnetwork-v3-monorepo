// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IEpochsManager} from "@pnetwork/dao-v2-contracts/contracts/interfaces/IEpochsManager.sol";
import {GovernanceMessageHandler} from "../governance/GovernanceMessageHandler.sol";
import {IPToken} from "../interfaces/IPToken.sol";
import {IPFactory} from "../interfaces/IPFactory.sol";
import {IPNetworkHub} from "../interfaces/IPNetworkHub.sol";
import {IPReceiver} from "../interfaces/IPReceiver.sol";
import {Constants} from "../libraries/Constants.sol";
import {Utils} from "../libraries/Utils.sol";
import {Network} from "../libraries/Network.sol";

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
error InvalidAssetParameters(uint256 assetAmount, address assetTokenAddress);
error InvalidProtocolFeeAssetParameters(uint256 protocolFeeAssetAmount, address protocolFeeAssetTokenAddress);
error InvalidUserOperation();
error NoUserOperation();
error PTokenNotCreated(address pTokenAddress);
error InvalidNetwork(bytes4 networkId);
error NotContract(address addr);
error LockDown();
error InvalidGovernanceMessage(bytes message);
error InvalidLockedAmountChallengePeriod(
    uint256 lockedAmountChallengePeriod,
    uint256 expectedLockedAmountChallengePeriod
);
error CallFailed();
error QueueFull();

contract PNetworkHub is IPNetworkHub, GovernanceMessageHandler, ReentrancyGuard {
    mapping(bytes32 => Action) private _operationsRelayerQueueAction;
    mapping(bytes32 => Action) private _operationsGovernanceCancelAction;
    mapping(bytes32 => Action) private _operationsGuardianCancelAction;
    mapping(bytes32 => Action) private _operationsSentinelCancelAction;
    mapping(bytes32 => Action) private _operationsExecuteAction;
    mapping(bytes32 => uint8) private _operationsTotalCancelActions;
    mapping(bytes32 => OperationStatus) private _operationsStatus;
    mapping(uint16 => bytes32) private _epochsSentinelsRoot;

    address public immutable factory;
    address public immutable epochsManager;
    uint32 public immutable baseChallengePeriodDuration;
    uint16 public immutable kChallengePeriod;
    uint16 public immutable maxOperationsInQueue;
    //bytes4 public immutable interimChainNetworkId;

    // bytes32 public guardiansRoot;
    uint256 public lockedAmountChallengePeriod;
    uint16 public numberOfOperationsInQueue;

    modifier onlySentinel(bytes calldata proof, string memory action) {
        _;
    }

    modifier onlyGuardian(bytes calldata proof, string memory action) {
        // TODO: check if msg.sender is a guardian
        _;
    }

    modifier onlyGovernance(bytes calldata proof, string memory action) {
        // TODO: check if msg.sender is a governance
        _;
    }

    modifier onlyWhenIsNotInLockDown(bool addMaxChallengePeriodDuration) {
        uint16 currentEpoch = IEpochsManager(epochsManager).currentEpoch();
        if (_epochsSentinelsRoot[currentEpoch] == bytes32(0)) {
            revert LockDown();
        }

        uint256 epochDuration = IEpochsManager(epochsManager).epochDuration();
        uint256 startFirstEpochTimestamp = IEpochsManager(epochsManager).startFirstEpochTimestamp();
        uint256 currentEpochEndTimestamp = startFirstEpochTimestamp + ((currentEpoch + 1) * epochDuration);

        // If a relayer queues a malicious operation shortly before lockdown mode begins, what happens?
        // When lockdown mode is initiated, both sentinels and guardians lose their ability to cancel operations.
        // Consequently, the malicious operation may be executed immediately after the lockdown period ends,
        // especially if the operation's queue time is significantly shorter than the lockdown duration.
        // To mitigate this risk, operations should not be queued if the max challenge period makes
        // the operation challenge period finish after 1 hour before the end of an epoch.
        if (
            block.timestamp +
                (
                    addMaxChallengePeriodDuration
                        ? baseChallengePeriodDuration +
                            (maxOperationsInQueue * maxOperationsInQueue * kChallengePeriod) -
                            kChallengePeriod
                        : 0
                ) >=
            currentEpochEndTimestamp - 3600
        ) {
            revert LockDown();
        }

        _;
    }

    constructor(
        address factory_,
        uint32 baseChallengePeriodDuration_,
        address epochsManager_,
        address telepathyRouter,
        address governanceMessageVerifier,
        uint32 allowedSourceChainId,
        uint256 lockedAmountChallengePeriod_,
        uint16 kChallengePeriod_,
        uint16 maxOperationsInQueue_
    )
        //bytes4 interimChainNetworkId_
        GovernanceMessageHandler(telepathyRouter, governanceMessageVerifier, allowedSourceChainId)
    {
        factory = factory_;
        epochsManager = epochsManager_;
        baseChallengePeriodDuration = baseChallengePeriodDuration_;
        lockedAmountChallengePeriod = lockedAmountChallengePeriod_;
        kChallengePeriod = kChallengePeriod_;
        maxOperationsInQueue = maxOperationsInQueue_;
        //interimChainNetworkId = interimChainNetworkId_;
    }

    /// @inheritdoc IPNetworkHub
    function challengePeriodOf(Operation calldata operation) public view returns (uint64, uint64) {
        bytes32 operationId = operationIdOf(operation);
        OperationStatus operationStatus = _operationsStatus[operationId];
        return _challengePeriodOf(operationId, operationStatus);
    }

    function getCurrentChallengePeriodDuration() public view returns (uint64) {
        uint32 localNumberOfOperationsInQueue = numberOfOperationsInQueue;
        if (localNumberOfOperationsInQueue == 0) return baseChallengePeriodDuration;

        return
            baseChallengePeriodDuration +
            (localNumberOfOperationsInQueue * localNumberOfOperationsInQueue * kChallengePeriod) -
            kChallengePeriod;
    }

    /// @inheritdoc IPNetworkHub
    function getSentinelsRootForEpoch(uint16 epoch) external view returns (bytes32) {
        return _epochsSentinelsRoot[epoch];
    }

    /// @inheritdoc IPNetworkHub
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

    /// @inheritdoc IPNetworkHub
    function operationStatusOf(Operation calldata operation) external view returns (OperationStatus) {
        return _operationsStatus[operationIdOf(operation)];
    }

    /// @inheritdoc IPNetworkHub
    function protocolGuardianCancelOperation(
        Operation calldata operation,
        bytes calldata proof
    ) external onlyWhenIsNotInLockDown(false) onlyGuardian(proof, "cancel") {
        _protocolCancelOperation(operation, Actor.Guardian);
    }

    /// @inheritdoc IPNetworkHub
    function protocolGovernanceCancelOperation(
        Operation calldata operation,
        bytes calldata proof
    ) external onlyGovernance(proof, "cancel") {
        _protocolCancelOperation(operation, Actor.Governance);
    }

    /// @inheritdoc IPNetworkHub
    function protocolSentinelCancelOperation(
        Operation calldata operation,
        bytes calldata proof
    ) external onlyWhenIsNotInLockDown(false) onlySentinel(proof, "cancel") {
        _protocolCancelOperation(operation, Actor.Sentinel);
    }

    /// @inheritdoc IPNetworkHub
    function protocolExecuteOperation(
        Operation calldata operation
    ) external payable onlyWhenIsNotInLockDown(false) nonReentrant {
        bytes32 operationId = operationIdOf(operation);

        OperationStatus operationStatus = _operationsStatus[operationId];
        if (operationStatus == OperationStatus.Executed) {
            revert OperationAlreadyExecuted(operation);
        } else if (operationStatus == OperationStatus.Cancelled) {
            revert OperationAlreadyCancelled(operation);
        } else if (operationStatus == OperationStatus.Null) {
            revert OperationNotQueued(operation);
        }

        (uint64 startTimestamp, uint64 endTimestamp) = _challengePeriodOf(operationId, operationStatus);
        if (uint64(block.timestamp) < endTimestamp) {
            revert ChallengePeriodNotTerminated(startTimestamp, endTimestamp);
        }

        address pTokenAddress = IPFactory(factory).getPTokenAddress(
            operation.underlyingAssetName,
            operation.underlyingAssetSymbol,
            operation.underlyingAssetDecimals,
            operation.underlyingAssetTokenAddress,
            operation.underlyingAssetNetworkId
        );

        // _takeProtocolFee(operation, pTokenAddress);

        /*if (interimChainNetworkId != operation.destinationNetworkId) {
            _releaseOperationLockedAmountChallengePeriod(operationId)
            emit UserOperation
            return;
        }*/

        address destinationAddress = Utils.parseAddress(operation.destinationAccount);
        if (operation.assetAmount > 0) {
            IPToken(pTokenAddress).protocolMint(destinationAddress, operation.assetAmount);

            if (Utils.isBitSet(operation.optionsMask, 0)) {
                if (!Network.isCurrentNetwork(operation.underlyingAssetNetworkId)) {
                    revert InvalidNetwork(operation.underlyingAssetNetworkId);
                }
                IPToken(pTokenAddress).protocolBurn(destinationAddress, operation.assetAmount);
            }
        }

        if (operation.userData.length > 0) {
            if (destinationAddress.code.length == 0) revert NotContract(destinationAddress);
            try IPReceiver(destinationAddress).receiveUserData(operation.userData) {} catch {}
        }

        _operationsStatus[operationId] = OperationStatus.Executed;
        _operationsExecuteAction[operationId] = Action(_msgSender(), uint64(block.timestamp));

        _releaseOperationLockedAmountChallengePeriod(operationId);

        unchecked {
            --numberOfOperationsInQueue;
        }
        emit OperationExecuted(operation);
    }

    function _releaseOperationLockedAmountChallengePeriod(bytes32 operationId) internal {
        Action storage queuedAction = _operationsRelayerQueueAction[operationId];
        (bool sent, ) = queuedAction.actor.call{value: lockedAmountChallengePeriod}("");
        if (!sent) {
            revert CallFailed();
        }
    }

    function _takeProtocolFee(Operation calldata operation, address pTokenAddress) internal {
        // take protocol fee and emit an user operation
        uint256 assetAmountWithoutFees = operation.assetAmount;

        // assetTokenAddress = pTokenAddress = ptoken on interim chain
        /*emit UserOperation(
            gasleft(),
            operation.destinationAccount,
            operation.destinationNetworkId,
            operation.underlyingAssetName,
            operation.underlyingAssetSymbol,
            operation.underlyingAssetDecimals,
            operation.underlyingAssetTokenAddress,
            operation.underlyingAssetNetworkId,
            pTokenAddress,
            assetAmountWithoutFees,
            operation.userData,
            operation.optionsMask
        );*/
    }

    /// @inheritdoc IPNetworkHub
    function protocolQueueOperation(Operation calldata operation) external payable onlyWhenIsNotInLockDown(true) {
        uint256 expectedLockedAmountChallengePeriod = lockedAmountChallengePeriod;
        if (msg.value != expectedLockedAmountChallengePeriod) {
            revert InvalidLockedAmountChallengePeriod(msg.value, expectedLockedAmountChallengePeriod);
        }

        if (numberOfOperationsInQueue >= maxOperationsInQueue) {
            revert QueueFull();
        }

        bytes32 operationId = operationIdOf(operation);

        OperationStatus operationStatus = _operationsStatus[operationId];
        if (operationStatus == OperationStatus.Executed) {
            revert OperationAlreadyExecuted(operation);
        } else if (operationStatus == OperationStatus.Cancelled) {
            revert OperationAlreadyCancelled(operation);
        } else if (operationStatus == OperationStatus.Queued) {
            revert OperationAlreadyQueued(operation);
        }

        _operationsRelayerQueueAction[operationId] = Action(_msgSender(), uint64(block.timestamp));
        _operationsStatus[operationId] = OperationStatus.Queued;
        unchecked {
            ++numberOfOperationsInQueue;
        }

        emit OperationQueued(operation);
    }

    /// @inheritdoc IPNetworkHub
    function userSend(
        string calldata destinationAccount,
        bytes4 destinationNetworkId,
        string calldata underlyingAssetName,
        string calldata underlyingAssetSymbol,
        uint256 underlyingAssetDecimals,
        address underlyingAssetTokenAddress,
        bytes4 underlyingAssetNetworkId,
        address assetTokenAddress,
        uint256 assetAmount,
        address protocolFeeAssetTokenAddress,
        uint256 protocolFeeAssetAmount,
        bytes calldata userData,
        bytes32 optionsMask
    ) external {
        address msgSender = _msgSender();

        if (
            (assetAmount > 0 && assetTokenAddress == address(0)) ||
            (assetAmount == 0 && assetTokenAddress != address(0))
        ) {
            revert InvalidAssetParameters(assetAmount, assetTokenAddress);
        }

        address pTokenAddress = IPFactory(factory).getPTokenAddress(
            underlyingAssetName,
            underlyingAssetSymbol,
            underlyingAssetDecimals,
            underlyingAssetTokenAddress,
            underlyingAssetNetworkId
        );
        if (pTokenAddress.code.length == 0) {
            revert PTokenNotCreated(pTokenAddress);
        }

        bool isCurrentNetwork = Network.isCurrentNetwork(destinationNetworkId);

        if (assetAmount > 0) {
            if (protocolFeeAssetAmount > 0 || protocolFeeAssetTokenAddress != address(0)) {
                revert InvalidProtocolFeeAssetParameters(protocolFeeAssetAmount, protocolFeeAssetTokenAddress);
            }

            // mint on the same chain
            if (underlyingAssetTokenAddress == assetTokenAddress && isCurrentNetwork) {
                IPToken(pTokenAddress).userMint(msgSender, assetAmount);
                // pegin
            } else if (underlyingAssetTokenAddress == assetTokenAddress && !isCurrentNetwork) {
                IPToken(pTokenAddress).userMintAndBurn(msgSender, assetAmount);
                // pegout
            } else if (pTokenAddress == assetTokenAddress && !isCurrentNetwork) {
                IPToken(pTokenAddress).userBurn(msgSender, assetAmount);
            }
            /*else if (pTokenAddress == assetTokenAddress && isCurrentNetwork) {
                IPToken(pTokenAddress).burn(assetAmount);
            }*/
            else {
                revert InvalidUserOperation();
            }
        } else if (userData.length > 0) {
            if (protocolFeeAssetAmount == 0 || protocolFeeAssetTokenAddress == address(0)) {
                revert InvalidProtocolFeeAssetParameters(protocolFeeAssetAmount, protocolFeeAssetTokenAddress);
            }

            // pegin
            if (underlyingAssetTokenAddress == protocolFeeAssetTokenAddress && !isCurrentNetwork) {
                IPToken(pTokenAddress).userMintAndBurn(msgSender, protocolFeeAssetAmount);
                // pegout
            } else if (pTokenAddress == protocolFeeAssetTokenAddress && !isCurrentNetwork) {
                IPToken(pTokenAddress).userBurn(msgSender, protocolFeeAssetAmount);
            } else {
                revert InvalidUserOperation();
            }
        } else {
            revert NoUserOperation();
        }

        emit UserOperation(
            gasleft(),
            destinationAccount,
            destinationNetworkId,
            underlyingAssetName,
            underlyingAssetSymbol,
            underlyingAssetDecimals,
            underlyingAssetTokenAddress,
            underlyingAssetNetworkId,
            assetTokenAddress,
            // NOTE: pTokens on host chains have always 18 decimals.
            Network.isCurrentNetwork(underlyingAssetNetworkId)
                ? Utils.normalizeAmount(assetAmount, underlyingAssetDecimals, true)
                : assetAmount,
            protocolFeeAssetTokenAddress,
            Network.isCurrentNetwork(underlyingAssetNetworkId)
                ? Utils.normalizeAmount(protocolFeeAssetAmount, underlyingAssetDecimals, true)
                : protocolFeeAssetAmount,
            userData,
            optionsMask
        );
    }

    function _challengePeriodOf(
        bytes32 operationId,
        OperationStatus operationStatus
    ) internal view returns (uint64, uint64) {
        // TODO: What is the challenge period of an already executed/cancelled operation
        if (operationStatus != OperationStatus.Queued) return (0, 0);

        Action storage queueAction = _operationsRelayerQueueAction[operationId];
        uint64 startTimestamp = queueAction.timestamp;
        uint64 endTimestamp = startTimestamp + getCurrentChallengePeriodDuration();
        if (_operationsTotalCancelActions[operationId] == 0) {
            return (startTimestamp, endTimestamp);
        }

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

        OperationStatus operationStatus = _operationsStatus[operationId];
        if (operationStatus == OperationStatus.Executed) {
            revert OperationAlreadyExecuted(operation);
        } else if (operationStatus == OperationStatus.Cancelled) {
            revert OperationAlreadyCancelled(operation);
        } else if (operationStatus == OperationStatus.Null) {
            revert OperationNotQueued(operation);
        }

        (uint64 startTimestamp, uint64 endTimestamp) = _challengePeriodOf(operationId, operationStatus);
        if (uint64(block.timestamp) >= endTimestamp) {
            revert ChallengePeriodTerminated(startTimestamp, endTimestamp);
        }

        Action memory action = Action(_msgSender(), uint64(block.timestamp));
        if (actor == Actor.Governance) {
            if (_operationsGovernanceCancelAction[operationId].actor != address(0)) {
                revert GovernanceOperationAlreadyCancelled(operation);
            }

            _operationsGovernanceCancelAction[operationId] = action;
            emit GovernanceOperationCancelled(operation);
        }
        if (actor == Actor.Guardian) {
            if (_operationsGuardianCancelAction[operationId].actor != address(0)) {
                revert GuardianOperationAlreadyCancelled(operation);
            }

            _operationsGuardianCancelAction[operationId] = action;
            emit GuardianOperationCancelled(operation);
        }
        if (actor == Actor.Sentinel) {
            if (_operationsSentinelCancelAction[operationId].actor != address(0)) {
                revert SentinelOperationAlreadyCancelled(operation);
            }

            _operationsSentinelCancelAction[operationId] = action;
            emit SentinelOperationCancelled(operation);
        }

        unchecked {
            ++_operationsTotalCancelActions[operationId];
        }
        if (_operationsTotalCancelActions[operationId] == 2) {
            unchecked {
                --numberOfOperationsInQueue;
            }
            _operationsStatus[operationId] = OperationStatus.Cancelled;
            // TODO: Where should we send the lockedAmountChallengePeriod?
            emit OperationCancelled(operation);
        }
    }

    function _onGovernanceMessage(bytes memory message) internal override {
        bytes memory decodedMessage = abi.decode(message, (bytes));
        (bytes32 messageType, bytes memory data) = abi.decode(decodedMessage, (bytes32, bytes));

        if (messageType == Constants.GOVERNANCE_MESSAGE_SENTINELS) {
            (uint16 epoch, bytes32 sentinelRoot) = abi.decode(data, (uint16, bytes32));
            _epochsSentinelsRoot[epoch] = bytes32(sentinelRoot);
            return;
        }

        // if (messageType == Constants.GOVERNANCE_MESSAGE_GUARDIANS) {
        //     guardiansRoot = bytes32(data);
        //     return;
        // }

        revert InvalidGovernanceMessage(message);
    }
}
