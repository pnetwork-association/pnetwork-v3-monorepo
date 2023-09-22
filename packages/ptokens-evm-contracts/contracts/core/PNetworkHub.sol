// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IEpochsManager} from "@pnetwork-association/dao-v2-contracts/contracts/interfaces/IEpochsManager.sol";
import {IFeesManager} from "@pnetwork-association/dao-v2-contracts/contracts/interfaces/IFeesManager.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {GovernanceMessageHandler} from "../governance/GovernanceMessageHandler.sol";
import {IPToken} from "../interfaces/IPToken.sol";
import {IPFactory} from "../interfaces/IPFactory.sol";
import {IPNetworkHub} from "../interfaces/IPNetworkHub.sol";
import {IPReceiver} from "../interfaces/IPReceiver.sol";
import {Utils} from "../libraries/Utils.sol";
import {Network} from "../libraries/Network.sol";

error OperationAlreadyQueued(IPNetworkHub.Operation operation);
error OperationAlreadyExecuted(IPNetworkHub.Operation operation);
error OperationAlreadyCancelled(IPNetworkHub.Operation operation);
error OperationCancelled(IPNetworkHub.Operation operation);
error OperationNotFound(IPNetworkHub.Operation operation);
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
error InvalidProtocolFee(IPNetworkHub.Operation operation);
error InvalidNetworkFeeAssetAmount();
error InvalidSentinel(address sentinel);
error InvalidGuardian(address guardian);
error InvalidLockedAmountStartChallenge(uint256 lockedAmountStartChallenge, uint256 expectedLockedAmountStartChallenge);
error InvalidActorStatus(IPNetworkHub.ActorStatus status, IPNetworkHub.ActorStatus expectedStatus);
error InvalidChallengeStatus(IPNetworkHub.ChallengeStatus status, IPNetworkHub.ChallengeStatus expectedStatus);
error NearToEpochEnd();
error ChallengeDurationPassed();
error MaxChallengeDurationNotPassed();
error ChallengeNotFound(IPNetworkHub.Challenge challenge);
error ChallengeDurationMustBeLessOrEqualThanMaxChallengePeriodDuration(uint64 challengeDuration, uint64 maxChallengePeriodDuration);
error InvalidEpoch(uint16 epoch);
error Inactive();

contract PNetworkHub is IPNetworkHub, GovernanceMessageHandler, ReentrancyGuard {
    bytes32 public constant GOVERNANCE_MESSAGE_GUARDIANS = keccak256("GOVERNANCE_MESSAGE_GUARDIANS");
    bytes32 public constant GOVERNANCE_MESSAGE_SENTINELS = keccak256("GOVERNANCE_MESSAGE_SENTINELS");
    bytes32 public constant GOVERNANCE_MESSAGE_SLASH_SENTINEL = keccak256("GOVERNANCE_MESSAGE_SLASH_SENTINEL");
    bytes32 public constant GOVERNANCE_MESSAGE_SLASH_GUARDIAN = keccak256("GOVERNANCE_MESSAGE_SLASH_GUARDIAN");
    bytes32 public constant GOVERNANCE_MESSAGE_RESUME_SENTINEL = keccak256("GOVERNANCE_MESSAGE_RESUME_SENTINEL");
    bytes32 public constant GOVERNANCE_MESSAGE_RESUME_GUARDIAN = keccak256("GOVERNANCE_MESSAGE_RESUME_GUARDIAN");
    uint256 public constant FEE_BASIS_POINTS_DIVISOR = 10000;

    mapping(bytes32 => Action) private _operationsRelayerQueueAction;
    mapping(bytes32 => Action) private _operationsGovernanceCancelAction;
    mapping(bytes32 => Action) private _operationsGuardianCancelAction;
    mapping(bytes32 => Action) private _operationsSentinelCancelAction;
    mapping(bytes32 => Action) private _operationsExecuteAction;
    mapping(bytes32 => uint8) private _operationsTotalCancelActions;
    mapping(bytes32 => OperationStatus) private _operationsStatus;
    mapping(uint16 => bytes32) private _epochsSentinelsMerkleRoot;
    mapping(uint16 => bytes32) private _epochsGuardiansMerkleRoot;
    mapping(uint16 => uint16) private _epochsTotalNumberOfSentinels;
    mapping(uint16 => uint16) private _epochsTotalNumberOfGuardians;
    mapping(uint16 => mapping(bytes32 => Challenge)) private _epochsChallenges;
    mapping(uint16 => mapping(bytes32 => ChallengeStatus)) private _epochsChallengesStatus;
    mapping(uint16 => mapping(address => ActorStatus)) private _epochsActorsStatus;
    mapping(uint16 => uint16) private _epochsTotalNumberOfInactiveActors;
    mapping(uint16 => mapping(address => bytes32)) private _epochsActorsPendingChallengeId;

    address public immutable factory;
    address public immutable epochsManager;
    address public immutable feesManager;
    address public immutable slasher;
    uint32 public immutable baseChallengePeriodDuration;
    uint32 public immutable maxChallengePeriodDuration;
    uint16 public immutable kChallengePeriod;
    uint16 public immutable maxOperationsInQueue;
    bytes4 public immutable interimChainNetworkId;
    uint256 public immutable lockedAmountChallengePeriod;
    uint256 public immutable lockedAmountStartChallenge;
    uint64 public immutable challengeDuration;

    uint256 public challengesNonce;
    uint16 public numberOfOperationsInQueue;

    constructor(
        address factory_,
        uint32 baseChallengePeriodDuration_,
        address epochsManager_,
        address feesManager_,
        address telepathyRouter,
        address governanceMessageVerifier,
        address slasher_,
        uint256 lockedAmountChallengePeriod_,
        uint16 kChallengePeriod_,
        uint16 maxOperationsInQueue_,
        bytes4 interimChainNetworkId_,
        uint256 lockedAmountOpenChallenge_,
        uint64 challengeDuration_,
        uint32 expectedSourceChainId
    ) GovernanceMessageHandler(telepathyRouter, governanceMessageVerifier, expectedSourceChainId) {
        // NOTE: see the comment within _checkNearEndOfEpochStartChallenge
        maxChallengePeriodDuration =
            baseChallengePeriodDuration_ +
            ((maxOperationsInQueue_ ** 2) * kChallengePeriod_) -
            kChallengePeriod_;
        if (challengeDuration_ > maxChallengePeriodDuration) {
            revert ChallengeDurationMustBeLessOrEqualThanMaxChallengePeriodDuration(challengeDuration_, maxChallengePeriodDuration);
        }

        factory = factory_;
        epochsManager = epochsManager_;
        feesManager = feesManager_;
        slasher = slasher_;
        baseChallengePeriodDuration = baseChallengePeriodDuration_;
        lockedAmountChallengePeriod = lockedAmountChallengePeriod_;
        kChallengePeriod = kChallengePeriod_;
        maxOperationsInQueue = maxOperationsInQueue_;
        interimChainNetworkId = interimChainNetworkId_;
        lockedAmountStartChallenge = lockedAmountOpenChallenge_;
        challengeDuration = challengeDuration_;
    }

    /// @inheritdoc IPNetworkHub
    function challengeIdOf(Challenge memory challenge) public pure returns (bytes32) {
        return
            sha256(
                abi.encode(
                    challenge.nonce,
                    challenge.actor,
                    challenge.challenger,
                    challenge.timestamp,
                    challenge.networkId
                )
            );
    }

    /// @inheritdoc IPNetworkHub
    function challengePeriodOf(Operation calldata operation) public view returns (uint64, uint64) {
        bytes32 operationId = operationIdOf(operation);
        OperationStatus operationStatus = _operationsStatus[operationId];
        return _challengePeriodOf(operationId, operationStatus);
    }

    /// @inheritdoc IPNetworkHub
    function claimLockedAmountStartChallenge(Challenge calldata challenge) external {
        bytes32 challengeId = challengeIdOf(challenge);
        uint16 currentEpoch = IEpochsManager(epochsManager).currentEpoch();
        uint16 challengeEpoch = getChallengeEpoch(challenge);

        if (challengeEpoch >= currentEpoch) {
            revert InvalidEpoch(challengeEpoch);
        }

        ChallengeStatus challengeStatus = _epochsChallengesStatus[challengeEpoch][challengeId];
        if (challengeStatus == ChallengeStatus.Null) {
            revert ChallengeNotFound(challenge);
        }

        if (challengeStatus != ChallengeStatus.Pending) {
            revert InvalidChallengeStatus(challengeStatus, ChallengeStatus.Pending);
        }

        _epochsChallengesStatus[challengeEpoch][challengeId] = ChallengeStatus.PartiallyUnsolved;

        (bool sent, ) = challenge.challenger.call{value: lockedAmountStartChallenge}("");
        if (!sent) {
            revert CallFailed();
        }

        emit ChallengePartiallyUnsolved(challenge);
    }

    /// @inheritdoc IPNetworkHub
    function getChallengeEpoch(Challenge calldata challenge) public view returns (uint16) {
        uint256 epochDuration = IEpochsManager(epochsManager).epochDuration();
        uint256 startFirstEpochTimestamp = IEpochsManager(epochsManager).startFirstEpochTimestamp();
        return uint16((challenge.timestamp - startFirstEpochTimestamp) / epochDuration);
    }

    /// @inheritdoc IPNetworkHub
    function getChallengeStatus(Challenge calldata challenge) external view returns (ChallengeStatus) {
        return _epochsChallengesStatus[getChallengeEpoch(challenge)][challengeIdOf(challenge)];
    }

    /// @inheritdoc IPNetworkHub
    function getCurrentActiveActorsAdjustmentDuration() public view returns (uint64) {
        uint16 currentEpoch = IEpochsManager(epochsManager).currentEpoch();
        uint16 activeActors = (_epochsTotalNumberOfSentinels[currentEpoch] +
            _epochsTotalNumberOfGuardians[currentEpoch]) - _epochsTotalNumberOfInactiveActors[currentEpoch];
        return 30 days / ((activeActors ** 5) + 1);
    }

    /// @inheritdoc IPNetworkHub
    function getCurrentChallengePeriodDuration() public view returns (uint64) {
        return getCurrentActiveActorsAdjustmentDuration() + getCurrentQueuedOperationsAdjustmentDuration();
    }

    /// @inheritdoc IPNetworkHub
    function getCurrentQueuedOperationsAdjustmentDuration() public view returns (uint64) {
        uint32 localNumberOfOperationsInQueue = numberOfOperationsInQueue;
        if (localNumberOfOperationsInQueue == 0) return baseChallengePeriodDuration;

        return
            baseChallengePeriodDuration + ((localNumberOfOperationsInQueue ** 2) * kChallengePeriod) - kChallengePeriod;
    }

    /// @inheritdoc IPNetworkHub
    function getGuardiansMerkleRootForEpoch(uint16 epoch) external view returns (bytes32) {
        return _epochsGuardiansMerkleRoot[epoch];
    }

    /// @inheritdoc IPNetworkHub
    function getNetworkId() external view returns (bytes4) {
        return Network.getCurrentNetworkId();
    }

    /// @inheritdoc IPNetworkHub
    function getPendingChallengeIdByEpochOf(uint16 epoch, address actor) external view returns (bytes32) {
        return _epochsActorsPendingChallengeId[epoch][actor];
    }

    /// @inheritdoc IPNetworkHub
    function getSentinelsMerkleRootForEpoch(uint16 epoch) external view returns (bytes32) {
        return _epochsSentinelsMerkleRoot[epoch];
    }

    /// @inheritdoc IPNetworkHub
    function getTotalNumberOfInactiveActorsForCurrentEpoch() external view returns (uint16) {
        return _epochsTotalNumberOfInactiveActors[IEpochsManager(epochsManager).currentEpoch()];
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
                    operation.originAccount,
                    operation.destinationAccount,
                    operation.destinationNetworkId,
                    operation.forwardDestinationNetworkId,
                    operation.underlyingAssetName,
                    operation.underlyingAssetSymbol,
                    operation.underlyingAssetDecimals,
                    operation.underlyingAssetTokenAddress,
                    operation.underlyingAssetNetworkId,
                    operation.assetAmount,
                    operation.protocolFeeAssetAmount,
                    operation.networkFeeAssetAmount,
                    operation.forwardNetworkFeeAssetAmount,
                    operation.userData,
                    operation.optionsMask,
                    operation.isForProtocol
                )
            );
    }

    /// @inheritdoc IPNetworkHub
    function operationStatusOf(Operation calldata operation) external view returns (OperationStatus) {
        return _operationsStatus[operationIdOf(operation)];
    }

    /// @inheritdoc IPNetworkHub
    function protocolGuardianCancelOperation(Operation calldata operation, bytes32[] calldata proof) external {
        _checkLockDownMode(false);
        address guardian = _msgSender();
        if (!_isGuardian(guardian, proof)) {
            revert InvalidGuardian(guardian);
        }

        _protocolCancelOperation(operation, operationIdOf(operation), guardian, ActorTypes.Guardian);
    }

    /// @inheritdoc IPNetworkHub
    function protocolGovernanceCancelOperation(Operation calldata operation) external {
        // TODO check if msg.sender is governance
        _protocolCancelOperation(operation, operationIdOf(operation), msg.sender, ActorTypes.Governance);
    }

    /// @inheritdoc IPNetworkHub
    function protocolSentinelCancelOperation(
        Operation calldata operation,
        bytes32[] calldata proof,
        bytes calldata signature
    ) external {
        _checkLockDownMode(false);
        bytes32 operationId = operationIdOf(operation);
        address sentinel = ECDSA.recover(ECDSA.toEthSignedMessageHash(operationId), signature);
        if (!_isSentinel(sentinel, proof)) {
            revert InvalidSentinel(sentinel);
        }

        _protocolCancelOperation(operation, operationId, sentinel, ActorTypes.Sentinel);
    }

    /// @inheritdoc IPNetworkHub
    function protocolExecuteOperation(Operation calldata operation) external payable nonReentrant {
        _checkLockDownMode(false);

        bytes32 operationId = operationIdOf(operation);
        OperationStatus operationStatus = _operationsStatus[operationId];
        if (operationStatus == OperationStatus.Executed) {
            revert OperationAlreadyExecuted(operation);
        } else if (operationStatus == OperationStatus.Cancelled) {
            revert OperationAlreadyCancelled(operation);
        } else if (operationStatus == OperationStatus.Null) {
            revert OperationNotFound(operation);
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

        uint256 effectiveOperationAssetAmount = operation.assetAmount;

        // NOTE: if we are on the interim chain we must take the fee
        if (interimChainNetworkId == Network.getCurrentNetworkId()) {
            effectiveOperationAssetAmount = _takeProtocolFee(operation, pTokenAddress);

            // NOTE: if we are on interim chain but the effective destination chain (forwardDestinationNetworkId) is another one
            // we have to emit an user Operation without protocol fee and with effectiveOperationAssetAmount and forwardDestinationNetworkId as
            // destinationNetworkId in order to proxy the Operation on the destination chain.
            if (
                interimChainNetworkId != operation.forwardDestinationNetworkId &&
                operation.forwardDestinationNetworkId != bytes4(0)
            ) {
                effectiveOperationAssetAmount = _takeNetworkFee(
                    effectiveOperationAssetAmount,
                    operation.networkFeeAssetAmount,
                    operationId,
                    pTokenAddress
                );

                _releaseOperationLockedAmountChallengePeriod(operationId);
                emit UserOperation(
                    gasleft(),
                    operation.originAccount,
                    operation.destinationAccount,
                    operation.forwardDestinationNetworkId,
                    operation.underlyingAssetName,
                    operation.underlyingAssetSymbol,
                    operation.underlyingAssetDecimals,
                    operation.underlyingAssetTokenAddress,
                    operation.underlyingAssetNetworkId,
                    pTokenAddress,
                    effectiveOperationAssetAmount,
                    address(0),
                    0,
                    operation.forwardNetworkFeeAssetAmount,
                    0,
                    bytes4(0),
                    operation.userData,
                    operation.optionsMask,
                    operation.isForProtocol
                );

                emit OperationExecuted(operation);
                return;
            }
        }

        effectiveOperationAssetAmount = _takeNetworkFee(
            effectiveOperationAssetAmount,
            operation.networkFeeAssetAmount,
            operationId,
            pTokenAddress
        );

        // NOTE: Execute the operation on the target blockchain. If destinationNetworkId is equivalent to
        // interimChainNetworkId, then the effectiveOperationAssetAmount would be the result of operation.assetAmount minus
        // the associated fee. However, if destinationNetworkId is not the same as interimChainNetworkId, the effectiveOperationAssetAmount
        // is equivalent to operation.assetAmount. In this case, as the operation originates from the interim chain, the operation.assetAmount
        // doesn't include the fee. This is because when the UserOperation event is triggered, and the interimChainNetworkId
        // does not equal operation.destinationNetworkId, the event contains the effectiveOperationAssetAmount.
        address destinationAddress = Utils.hexStringToAddress(operation.destinationAccount);
        if (effectiveOperationAssetAmount > 0) {
            IPToken(pTokenAddress).protocolMint(destinationAddress, effectiveOperationAssetAmount);

            if (Utils.isBitSet(operation.optionsMask, 0)) {
                if (!Network.isCurrentNetwork(operation.underlyingAssetNetworkId)) {
                    revert InvalidNetwork(operation.underlyingAssetNetworkId);
                }
                IPToken(pTokenAddress).protocolBurn(destinationAddress, effectiveOperationAssetAmount);
            }
        }

        if (operation.userData.length > 0) {
            if (destinationAddress.code.length == 0) revert NotContract(destinationAddress);

            try
                IPReceiver(destinationAddress).receiveUserData(
                    operation.originNetworkId,
                    operation.originAccount,
                    operation.userData
                )
            {} catch {}
        }

        _releaseOperationLockedAmountChallengePeriod(operationId);
        emit OperationExecuted(operation);
    }

    /// @inheritdoc IPNetworkHub
    function protocolQueueOperation(Operation calldata operation) external payable {
        _checkLockDownMode(true);

        if (msg.value != lockedAmountChallengePeriod) {
            revert InvalidLockedAmountChallengePeriod(msg.value, lockedAmountChallengePeriod);
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

        _operationsRelayerQueueAction[operationId] = Action({actor: _msgSender(), timestamp: uint64(block.timestamp)});
        _operationsStatus[operationId] = OperationStatus.Queued;
        unchecked {
            ++numberOfOperationsInQueue;
        }

        emit OperationQueued(operation);
    }

    /// @inheritdoc IPNetworkHub
    function slashByChallenge(Challenge calldata challenge) external {
        bytes32 challengeId = challengeIdOf(challenge);
        uint16 currentEpoch = IEpochsManager(epochsManager).currentEpoch();
        ChallengeStatus challengeStatus = _epochsChallengesStatus[currentEpoch][challengeId];

        // NOTE: avoid to slash by challenges opened in previous epochs
        if (challengeStatus == ChallengeStatus.Null) {
            revert ChallengeNotFound(challenge);
        }

        if (challengeStatus != ChallengeStatus.Pending) {
            revert InvalidChallengeStatus(challengeStatus, ChallengeStatus.Pending);
        }

        if (block.timestamp <= challenge.timestamp + challengeDuration) {
            revert MaxChallengeDurationNotPassed();
        }

        _epochsChallengesStatus[currentEpoch][challengeId] = ChallengeStatus.Unsolved;
        _epochsActorsStatus[currentEpoch][challenge.actor] = ActorStatus.Inactive;
        delete _epochsActorsPendingChallengeId[currentEpoch][challenge.actor];

        (bool sent, ) = challenge.challenger.call{value: lockedAmountStartChallenge}("");
        if (!sent) {
            revert CallFailed();
        }

        unchecked {
            ++_epochsTotalNumberOfInactiveActors[currentEpoch];
        }

        bytes4 currentNetworkId = Network.getCurrentNetworkId();
        if (currentNetworkId == interimChainNetworkId) {
            // NOTE: If a slash happens on the interim chain we can avoid to emit the UserOperation
            //  in order to speed up the slashing process
            IPReceiver(slasher).receiveUserData(
                currentNetworkId,
                Utils.addressToHexString(address(this)),
                abi.encode(challenge.actor, challenge.challenger)
            );
        } else {
            emit UserOperation(
                gasleft(),
                Utils.addressToHexString(address(this)),
                Utils.addressToHexString(slasher),
                interimChainNetworkId,
                "",
                "",
                0,
                address(0),
                bytes4(0),
                address(0),
                0,
                address(0),
                0,
                0,
                0,
                0,
                abi.encode(challenge.actor, challenge.challenger),
                bytes32(0),
                true // isForProtocol
            );
        }

        emit ChallengeUnsolved(challenge);
    }

    /// @inheritdoc IPNetworkHub
    function solveChallengeGuardian(Challenge calldata challenge, bytes32[] calldata proof) external {
        address guardian = _msgSender();
        if (guardian != challenge.actor || !_isGuardian(guardian, proof)) {
            revert InvalidGuardian(guardian);
        }

        _solveChallenge(challenge, challengeIdOf(challenge));
    }

    /// @inheritdoc IPNetworkHub
    function solveChallengeSentinel(
        Challenge calldata challenge,
        bytes32[] calldata proof,
        bytes calldata signature
    ) external {
        bytes32 challengeId = challengeIdOf(challenge);
        address sentinel = ECDSA.recover(ECDSA.toEthSignedMessageHash(challengeId), signature);
        if (sentinel != challenge.actor || !_isSentinel(sentinel, proof)) {
            revert InvalidSentinel(sentinel);
        }

        _solveChallenge(challenge, challengeId);
    }

    /// @inheritdoc IPNetworkHub
    function startChallengeGuardian(address guardian, bytes32[] calldata proof) external payable {
        _checkNearEndOfEpochStartChallenge();
        if (!_isGuardian(guardian, proof)) {
            revert InvalidGuardian(guardian);
        }

        _startChallenge(guardian);
    }

    /// @inheritdoc IPNetworkHub
    function startChallengeSentinel(address sentinel, bytes32[] calldata proof) external payable {
        _checkNearEndOfEpochStartChallenge();
        if (!_isSentinel(sentinel, proof)) {
            revert InvalidSentinel(sentinel);
        }

        _startChallenge(sentinel);
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
        uint256 networkFeeAssetAmount,
        uint256 forwardNetworkFeeAssetAmount,
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

        if (networkFeeAssetAmount > assetAmount) {
            revert InvalidNetworkFeeAssetAmount();
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

        // TODO: A user might bypass paying the protocol fee when sending userData, particularly
        // if they dispatch userData with an assetAmount greater than zero. However, if the countervalue of
        // the assetAmount is less than the protocol fee, it implies the user has paid less than the
        // required protocol fee to transmit userData. How can we fix this problem?
        if (assetAmount > 0) {
            if (protocolFeeAssetAmount > 0 || protocolFeeAssetTokenAddress != address(0)) {
                revert InvalidProtocolFeeAssetParameters(protocolFeeAssetAmount, protocolFeeAssetTokenAddress);
            }

            if (underlyingAssetTokenAddress == assetTokenAddress && isCurrentNetwork) {
                IPToken(pTokenAddress).userMint(msgSender, assetAmount);
            } else if (underlyingAssetTokenAddress == assetTokenAddress && !isCurrentNetwork) {
                IPToken(pTokenAddress).userMintAndBurn(msgSender, assetAmount);
            } else if (pTokenAddress == assetTokenAddress && !isCurrentNetwork) {
                IPToken(pTokenAddress).userBurn(msgSender, assetAmount);
            } else {
                revert InvalidUserOperation();
            }
        } else if (userData.length > 0) {
            if (protocolFeeAssetAmount == 0 || protocolFeeAssetTokenAddress == address(0)) {
                revert InvalidProtocolFeeAssetParameters(protocolFeeAssetAmount, protocolFeeAssetTokenAddress);
            }

            if (underlyingAssetTokenAddress == protocolFeeAssetTokenAddress && !isCurrentNetwork) {
                IPToken(pTokenAddress).userMintAndBurn(msgSender, protocolFeeAssetAmount);
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
            Utils.addressToHexString(msgSender),
            destinationAccount,
            interimChainNetworkId,
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
            Network.isCurrentNetwork(underlyingAssetNetworkId)
                ? Utils.normalizeAmount(networkFeeAssetAmount, underlyingAssetDecimals, true)
                : networkFeeAssetAmount,
            Network.isCurrentNetwork(underlyingAssetNetworkId)
                ? Utils.normalizeAmount(forwardNetworkFeeAssetAmount, underlyingAssetDecimals, true)
                : forwardNetworkFeeAssetAmount,
            destinationNetworkId,
            userData,
            optionsMask,
            false // isForProtocol
        );
    }

    function _challengePeriodOf(
        bytes32 operationId,
        OperationStatus operationStatus
    ) internal view returns (uint64, uint64) {
        if (operationStatus != OperationStatus.Queued) return (0, 0);

        Action storage queueAction = _operationsRelayerQueueAction[operationId];
        uint64 startTimestamp = queueAction.timestamp;
        uint64 endTimestamp = startTimestamp + getCurrentChallengePeriodDuration();
        if (_operationsTotalCancelActions[operationId] == 0) {
            return (startTimestamp, endTimestamp);
        }

        if (_operationsGuardianCancelAction[operationId].actor != address(0)) {
            endTimestamp += 5 days;
        }

        if (_operationsSentinelCancelAction[operationId].actor != address(0)) {
            endTimestamp += 5 days;
        }

        return (startTimestamp, endTimestamp);
    }

    function _checkLockDownMode(bool addMaxChallengePeriodDuration) internal view {
        uint16 currentEpoch = IEpochsManager(epochsManager).currentEpoch();
        if (
            _epochsSentinelsMerkleRoot[currentEpoch] == bytes32(0) ||
            _epochsGuardiansMerkleRoot[currentEpoch] == bytes32(0) ||
            _epochsTotalNumberOfInactiveActors[currentEpoch] ==
            _epochsTotalNumberOfSentinels[currentEpoch] + _epochsTotalNumberOfGuardians[currentEpoch]
        ) {
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
            block.timestamp + (addMaxChallengePeriodDuration ? maxChallengePeriodDuration : 0) >=
            currentEpochEndTimestamp - 1 hours
        ) {
            revert LockDown();
        }
    }

    function _checkNearEndOfEpochStartChallenge() internal view {
        uint256 epochDuration = IEpochsManager(epochsManager).epochDuration();
        uint16 currentEpoch = IEpochsManager(epochsManager).currentEpoch();
        uint256 startFirstEpochTimestamp = IEpochsManager(epochsManager).startFirstEpochTimestamp();
        uint256 currentEpochEndTimestamp = startFirstEpochTimestamp + ((currentEpoch + 1) * epochDuration);

        // NOTE: 1 hours = threshold that a guardian/sentinel or challenger has time to resolve the challenge
        // before the epoch ends. Not setting this threshold would mean that it is possible
        // to open a challenge that can be solved an instant before the epoch change causing problems.
        // It is important that the system enters in lockdown mode before stopping to start challenges.
        // In this way we are sure that no malicious operations can be queued when keep alive mechanism is disabled.
        // currentEpochEndTimestamp - 1 hours - challengeDuration <= currentEpochEndTimestamp - 1 hours - maxChallengePeriodDuration
        // challengeDuration <=  maxChallengePeriodDuration
        // challengeDuration <= baseChallengePeriodDuration + (maxOperationsInQueue * maxOperationsInQueue * kChallengePeriod) - kChallengePeriod
        if (block.timestamp + challengeDuration > currentEpochEndTimestamp - 1 hours) {
            revert NearToEpochEnd();
        }
    }

    function _isGuardian(address guardian, bytes32[] calldata proof) internal view returns (bool) {
        return
            MerkleProof.verify(
                proof,
                _epochsGuardiansMerkleRoot[IEpochsManager(epochsManager).currentEpoch()],
                keccak256(abi.encodePacked(guardian))
            );
    }

    function _isSentinel(address sentinel, bytes32[] calldata proof) internal view returns (bool) {
        return
            MerkleProof.verify(
                proof,
                _epochsSentinelsMerkleRoot[IEpochsManager(epochsManager).currentEpoch()],
                keccak256(abi.encodePacked(sentinel))
            );
    }

    function _maybeCancelPendingChallenge(uint16 epoch, address actor) internal {
        bytes32 pendingChallengeId = _epochsActorsPendingChallengeId[epoch][actor];
        if (pendingChallengeId != bytes32(0)) {
            Challenge storage challenge = _epochsChallenges[epoch][pendingChallengeId];
            delete _epochsActorsPendingChallengeId[epoch][actor];
            _epochsChallengesStatus[epoch][pendingChallengeId] = ChallengeStatus.Cancelled;
            _epochsActorsStatus[epoch][challenge.actor] = ActorStatus.Active; // NOTE: Change Slashed into Active in order to trigger the slash below
            (bool sent, ) = challenge.challenger.call{value: lockedAmountStartChallenge}("");
            if (!sent) {
                revert CallFailed();
            }

            emit ChallengeCancelled(challenge);
        }
    }

    function _onGovernanceMessage(bytes memory message) internal override {
        (bytes32 messageType, bytes memory messageData) = abi.decode(message, (bytes32, bytes));

        if (messageType == GOVERNANCE_MESSAGE_GUARDIANS) {
            (uint16 epoch, uint16 totalNumberOfGuardians, bytes32 guardiansMerkleRoot) = abi.decode(
                messageData,
                (uint16, uint16, bytes32)
            );

            _epochsGuardiansMerkleRoot[epoch] = guardiansMerkleRoot;
            _epochsTotalNumberOfGuardians[epoch] = totalNumberOfGuardians;

            return;
        }

        if (messageType == GOVERNANCE_MESSAGE_SENTINELS) {
            (uint16 epoch, uint16 totalNumberOfSentinels, bytes32 sentinelsMerkleRoot) = abi.decode(
                messageData,
                (uint16, uint16, bytes32)
            );

            _epochsSentinelsMerkleRoot[epoch] = sentinelsMerkleRoot;
            _epochsTotalNumberOfSentinels[epoch] = totalNumberOfSentinels;

            return;
        }

        if (messageType == GOVERNANCE_MESSAGE_SLASH_SENTINEL) {
            (uint16 epoch, address sentinel) = abi.decode(messageData, (uint16, address));
            // NOTE: Consider the scenario where a sentinel's status is 'Challenged', and a GOVERNANCE_MESSAGE_SLASH_SENTINEL is received
            // for the same sentinel before the challenge is resolved or the sentinel is slashed.
            // If a sentinel is already 'Challenged', we should:
            // - cancel the current challenge
            // - set to active the state of the sentinel
            // - send to the challenger the bond
            // - slash it
            _maybeCancelPendingChallenge(epoch, sentinel);

            if (_epochsActorsStatus[epoch][sentinel] == ActorStatus.Active) {
                unchecked {
                    ++_epochsTotalNumberOfInactiveActors[epoch];
                }
                _epochsActorsStatus[epoch][sentinel] = ActorStatus.Inactive;
                emit SentinelSlashed(epoch, sentinel);
            }
            return;
        }

        if (messageType == GOVERNANCE_MESSAGE_SLASH_GUARDIAN) {
            (uint16 epoch, address guardian) = abi.decode(messageData, (uint16, address));
            // NOTE: same comment above
            _maybeCancelPendingChallenge(epoch, guardian);

            if (_epochsActorsStatus[epoch][guardian] == ActorStatus.Active) {
                unchecked {
                    ++_epochsTotalNumberOfInactiveActors[epoch];
                }
                _epochsActorsStatus[epoch][guardian] = ActorStatus.Inactive;
                emit GuardianSlashed(epoch, guardian);
            }
            return;
        }

        if (messageType == GOVERNANCE_MESSAGE_RESUME_SENTINEL) {
            (uint16 epoch, address sentinel) = abi.decode(messageData, (uint16, address));
            if (_epochsActorsStatus[epoch][sentinel] == ActorStatus.Inactive) {
                unchecked {
                    --_epochsTotalNumberOfInactiveActors[epoch];
                }

                _epochsActorsStatus[epoch][sentinel] = ActorStatus.Active;
                emit SentinelResumed(epoch, sentinel);
            }

            return;
        }

        if (messageType == GOVERNANCE_MESSAGE_RESUME_GUARDIAN) {
            (uint16 epoch, address guardian) = abi.decode(messageData, (uint16, address));
            if (_epochsActorsStatus[epoch][guardian] == ActorStatus.Inactive) {
                unchecked {
                    --_epochsTotalNumberOfInactiveActors[epoch];
                }

                _epochsActorsStatus[epoch][guardian] = ActorStatus.Active;
                emit GuardianResumed(epoch, guardian);
            }

            return;
        }

        revert InvalidGovernanceMessage(message);
    }

    function _protocolCancelOperation(
        Operation calldata operation,
        bytes32 operationId,
        address actor,
        ActorTypes actorType
    ) internal {
        uint16 currentEpoch = IEpochsManager(epochsManager).currentEpoch();
        if (_epochsActorsStatus[currentEpoch][actor] == ActorStatus.Inactive) {
            revert Inactive();
        }

        OperationStatus operationStatus = _operationsStatus[operationId];
        if (operationStatus == OperationStatus.Executed) {
            revert OperationAlreadyExecuted(operation);
        } else if (operationStatus == OperationStatus.Cancelled) {
            revert OperationAlreadyCancelled(operation);
        } else if (operationStatus == OperationStatus.Null) {
            revert OperationNotFound(operation);
        }

        (uint64 startTimestamp, uint64 endTimestamp) = _challengePeriodOf(operationId, operationStatus);
        if (uint64(block.timestamp) >= endTimestamp) {
            revert ChallengePeriodTerminated(startTimestamp, endTimestamp);
        }

        Action memory action = Action({actor: _msgSender(), timestamp: uint64(block.timestamp)});
        if (actorType == ActorTypes.Governance) {
            if (_operationsGovernanceCancelAction[operationId].actor != address(0)) {
                revert GovernanceOperationAlreadyCancelled(operation);
            }

            _operationsGovernanceCancelAction[operationId] = action;
            emit GovernanceOperationCancelled(operation);
        }
        if (actorType == ActorTypes.Guardian) {
            if (_operationsGuardianCancelAction[operationId].actor != address(0)) {
                revert GuardianOperationAlreadyCancelled(operation);
            }

            _operationsGuardianCancelAction[operationId] = action;
            emit GuardianOperationCancelled(operation);
        }
        if (actorType == ActorTypes.Sentinel) {
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

            // TODO: send the lockedAmountChallengePeriod to the DAO
            (bool sent, ) = address(0).call{value: lockedAmountChallengePeriod}("");
            if (!sent) {
                revert CallFailed();
            }

            emit OperationCancelled(operation);
        }
    }

    function _releaseOperationLockedAmountChallengePeriod(bytes32 operationId) internal {
        _operationsStatus[operationId] = OperationStatus.Executed;
        _operationsExecuteAction[operationId] = Action({actor: _msgSender(), timestamp: uint64(block.timestamp)});

        Action storage queuedAction = _operationsRelayerQueueAction[operationId];
        (bool sent, ) = queuedAction.actor.call{value: lockedAmountChallengePeriod}("");
        if (!sent) {
            revert CallFailed();
        }

        unchecked {
            --numberOfOperationsInQueue;
        }
    }

    function _solveChallenge(Challenge calldata challenge, bytes32 challengeId) internal {
        uint16 currentEpoch = IEpochsManager(epochsManager).currentEpoch();
        ChallengeStatus challengeStatus = _epochsChallengesStatus[currentEpoch][challengeId];

        if (challengeStatus == ChallengeStatus.Null) {
            revert ChallengeNotFound(challenge);
        }

        if (challengeStatus != ChallengeStatus.Pending) {
            revert InvalidChallengeStatus(challengeStatus, ChallengeStatus.Pending);
        }

        if (block.timestamp > challenge.timestamp + challengeDuration) {
            revert ChallengeDurationPassed();
        }

        // TODO: send the lockedAmountStartChallenge to the DAO
        (bool sent, ) = address(0).call{value: lockedAmountStartChallenge}("");
        if (!sent) {
            revert CallFailed();
        }

        _epochsChallengesStatus[currentEpoch][challengeId] = ChallengeStatus.Solved;
        _epochsActorsStatus[currentEpoch][challenge.actor] = ActorStatus.Active;
        delete _epochsActorsPendingChallengeId[currentEpoch][challenge.actor];
        emit ChallengeSolved(challenge);
    }

    function _startChallenge(address actor) internal {
        address challenger = _msgSender();
        uint16 currentEpoch = IEpochsManager(epochsManager).currentEpoch();

        if (msg.value != lockedAmountStartChallenge) {
            revert InvalidLockedAmountStartChallenge(msg.value, lockedAmountStartChallenge);
        }

        ActorStatus actorStatus = _epochsActorsStatus[currentEpoch][actor];
        if (actorStatus != ActorStatus.Active) {
            revert InvalidActorStatus(actorStatus, ActorStatus.Active);
        }

        Challenge memory challenge = Challenge({
            nonce: challengesNonce,
            actor: actor,
            challenger: challenger,
            timestamp: uint64(block.timestamp),
            networkId: Network.getCurrentNetworkId()
        });
        bytes32 challengeId = challengeIdOf(challenge);
        _epochsChallenges[currentEpoch][challengeId] = challenge;
        _epochsChallengesStatus[currentEpoch][challengeId] = ChallengeStatus.Pending;
        _epochsActorsStatus[currentEpoch][actor] = ActorStatus.Challenged;
        _epochsActorsPendingChallengeId[currentEpoch][actor] = challengeId;

        unchecked {
            ++challengesNonce;
        }

        emit ChallengePending(challenge);
    }

    function _takeNetworkFee(
        uint256 operationAmount,
        uint256 operationNetworkFeeAssetAmount,
        bytes32 operationId,
        address pTokenAddress
    ) internal returns (uint256) {
        if (operationNetworkFeeAssetAmount == 0) return operationAmount;

        Action storage queuedAction = _operationsRelayerQueueAction[operationId];

        address queuedActionActor = queuedAction.actor;
        address executedActionActor = _msgSender();
        if (queuedActionActor == executedActionActor) {
            IPToken(pTokenAddress).protocolMint(queuedActionActor, operationNetworkFeeAssetAmount);
            return operationAmount - operationNetworkFeeAssetAmount;
        }

        // NOTE: protocolQueueOperation consumes in avg 117988. protocolExecuteOperation consumes in avg 198928.
        // which results in 37% to networkFeeQueueActor and 63% to networkFeeExecuteActor
        uint256 networkFeeQueueActor = (operationNetworkFeeAssetAmount * 3700) / FEE_BASIS_POINTS_DIVISOR; // 37%
        uint256 networkFeeExecuteActor = (operationNetworkFeeAssetAmount * 6300) / FEE_BASIS_POINTS_DIVISOR; // 63%
        IPToken(pTokenAddress).protocolMint(queuedActionActor, networkFeeQueueActor);
        IPToken(pTokenAddress).protocolMint(executedActionActor, networkFeeExecuteActor);

        return operationAmount - operationNetworkFeeAssetAmount;
    }

    function _takeProtocolFee(Operation calldata operation, address pTokenAddress) internal returns (uint256) {
        if (operation.assetAmount > 0 && operation.userData.length == 0) {
            uint256 feeBps = 20; // 0.2%
            uint256 fee = (operation.assetAmount * feeBps) / FEE_BASIS_POINTS_DIVISOR;
            IPToken(pTokenAddress).protocolMint(address(this), fee);
            IPToken(pTokenAddress).approve(feesManager, fee);
            IFeesManager(feesManager).depositFee(pTokenAddress, fee);
            return operation.assetAmount - fee;
        }
        // TODO: We need to determine how to process the fee when operation.userData.length is greater than zero
        //and operation.assetAmount is also greater than zero. By current design, userData is paid in USDC,
        // but what happens if a user wraps Ethereum, for example, and wants to couple it with a non-null
        //userData during the wrap operation? We must decide which token should be used for the userData fee payment.
        else if (operation.userData.length > 0 && operation.protocolFeeAssetAmount > 0) {
            // Take fee using pTokenAddress and operation.protocolFeeAssetAmount
            IPToken(pTokenAddress).protocolMint(address(this), operation.protocolFeeAssetAmount);
            // TODO: send it to the DAO
            return operation.assetAmount > 0 ? operation.assetAmount - operation.protocolFeeAssetAmount : 0;
        }

        if (operation.isForProtocol) {
            return 0;
        }

        revert InvalidProtocolFee(operation);
    }
}
