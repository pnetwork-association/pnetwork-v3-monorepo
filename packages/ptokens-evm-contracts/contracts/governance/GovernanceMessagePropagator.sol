// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IGovernanceMessagePropagator} from "../interfaces/IGovernanceMessagePropagator.sol";
import {IRegistrationManager} from "@pnetwork-association/dao-v2-contracts/contracts/interfaces/IRegistrationManager.sol";
import {ILendingManager} from "@pnetwork-association/dao-v2-contracts/contracts/interfaces/ILendingManager.sol";
import {IEpochsManager} from "@pnetwork-association/dao-v2-contracts/contracts/interfaces/IEpochsManager.sol";
import {MerkleTree} from "../libraries/MerkleTree.sol";

error InvalidAmount(uint256 amount, uint256 expectedAmount);
error InvalidGovernanceMessageVerifier(address governanceMessagerVerifier, address expectedGovernanceMessageVerifier);
error InvalidSentinelRegistration(bytes1 kind);
error NotRegistrationManager();

contract GovernanceMessagePropagator is IGovernanceMessagePropagator {
    bytes32 public constant GOVERNANCE_MESSAGE_STATE_SENTINELS = keccak256("GOVERNANCE_MESSAGE_STATE_SENTINELS");
    bytes32 public constant GOVERNANCE_MESSAGE_STATE_SENTINELS_MERKLE_ROOT =
        keccak256("GOVERNANCE_MESSAGE_STATE_SENTINELS_MERKLE_ROOT");
    bytes32 public constant GOVERNANCE_MESSAGE_STATE_GUARDIANS = keccak256("GOVERNANCE_MESSAGE_STATE_GUARDIANS");

    address public immutable epochsManager;
    address public immutable lendingManager;
    address public immutable registrationManager;

    modifier onlyRegistrationManager() {
        if (msg.sender != registrationManager) {
            revert NotRegistrationManager();
        }

        _;
    }

    constructor(address epochsManager_, address lendingManager_, address registrationManager_) {
        epochsManager = epochsManager_;
        lendingManager = lendingManager_;
        registrationManager = registrationManager_;
    }

    /// @inheritdoc IGovernanceMessagePropagator
    function propagateActors(address[] calldata sentinels, address[] calldata guardians) external {
        propagateSentinels(sentinels);
        propagateGuardians(guardians);
    }

    /// @inheritdoc IGovernanceMessagePropagator
    function propagateGuardians(address[] calldata guardians) public {
        uint16 currentEpoch = IEpochsManager(epochsManager).currentEpoch();
        // uint16 totalNumberOfGuardians = IRegistrationManager(registrationManager).totalNumberOfGuardians();
        // uint16 numberOfValidGuardians;
        // for (uint16 index = 0; i < guardians; ) {
        //     if (IRegistrationManager(registrationManager).isGuardian()) {
        //         unchecked {
        //             ++numberOfValidGuardians;
        //         }
        //     }
        //     unchecked {
        //         ++index;
        //     }
        // }
        // if (totalNumberOfGuardians != numberOfValidGuardians) {
        //     revert Error.InvalidNumberOfGuardians();
        // }
        // bytes[] memory data = new bytes[](guardians.length);
        // for (uint256 i = 0; i < guardians.length; i++) {
        //     data[i] = abi.encodePacked(guardians[i]);
        // }

        bytes32[] memory data = new bytes32[](guardians.length);
        for (uint256 i = 0; i < guardians.length; i++) {
            data[i] = keccak256(abi.encodePacked(guardians[i]));
        }

        emit GovernanceMessage(
            abi.encode(
                GOVERNANCE_MESSAGE_STATE_GUARDIANS,
                abi.encode(currentEpoch, guardians.length, MerkleTree.getRoot(data))
            )
        );
    }

    /// @inheritdoc IGovernanceMessagePropagator
    function propagateSentinels(address[] calldata sentinels) public {
        uint16 currentEpoch = IEpochsManager(epochsManager).currentEpoch();
        uint32 totalBorrowedAmount = ILendingManager(lendingManager).totalBorrowedAmountByEpoch(currentEpoch);
        uint256 totalSentinelStakedAmount = IRegistrationManager(registrationManager).totalSentinelStakedAmountByEpoch(
            currentEpoch
        );
        uint256 totalAmount = totalBorrowedAmount + totalSentinelStakedAmount;

        uint256 cumulativeAmount = 0;
        uint256 invalidIndex = sentinels.length + 1;
        uint256[] memory indexes = new uint256[](sentinels.length);
        uint256 validSentinels;

        // NOTE: be sure that totalSentinelStakedAmount + totalBorrowedAmount = cumulativeAmount.
        // There could be also sentinels that has less than 200k PNT because of slashing.
        // These sentinels will be filtered in the next step
        for (uint256 index; index < sentinels.length; ) {
            IRegistrationManager.Registration memory registration = IRegistrationManager(registrationManager)
                .sentinelRegistration(sentinels[index]);

            bytes1 registrationKind = registration.kind;
            if (registrationKind == 0x01) {
                uint256 amount = IRegistrationManager(registrationManager).sentinelStakedAmountByEpochOf(
                    sentinels[index],
                    currentEpoch
                );
                cumulativeAmount += amount;

                if (amount >= 200000) {
                    indexes[index] = index;
                    validSentinels++;
                } else {
                    indexes[index] = invalidIndex;
                }
            } else if (registrationKind == 0x02) {
                cumulativeAmount += 200000;
                indexes[index] = index;
                validSentinels++;
            } else {
                revert InvalidSentinelRegistration(registrationKind);
            }

            unchecked {
                ++index;
            }
        }

        if (totalAmount != cumulativeAmount) {
            revert InvalidAmount(totalAmount, cumulativeAmount);
        }

        // NOTE: filter sentinels that have been slashed and has less than 200k PNT at stake
        address[] memory effectiveSentinels = new address[](validSentinels);
        uint256 j = 0;
        for (uint256 i = 0; i < indexes.length; i++) {
            if (indexes[i] == invalidIndex) continue;
            effectiveSentinels[j] = sentinels[indexes[i]];
            j++;
        }

        bytes32[] memory data = new bytes32[](effectiveSentinels.length);
        for (uint256 i = 0; i < effectiveSentinels.length; i++) {
            data[i] = keccak256(abi.encodePacked(effectiveSentinels[i]));
        }

        emit GovernanceMessage(
            abi.encode(
                GOVERNANCE_MESSAGE_STATE_SENTINELS,
                abi.encode(currentEpoch, effectiveSentinels.length, MerkleTree.getRoot(data))
            )
        );
    }

    /// @inheritdoc IGovernanceMessagePropagator
    function propagateSentinelsByRemovingTheLeafByProof(bytes32[] calldata proof) external onlyRegistrationManager {
        uint16 currentEpoch = IEpochsManager(epochsManager).currentEpoch();

        // TODO: If a sentinel is able to call PNetworkHub.solveChallenge just to re-enable the sentinel
        // before that the new merkle root is propagated on all chains we could
        // have (on the PNetworkHub) the _epochsTotalNumberOfInactiveActors[epoch] = effectiveNumberOfActiveSentinels + 1
        // and because of this, lockdown mode will be never triggered.
        // we could force to decrement _epochsTotalNumberOfInactiveActors[epoch] when a new GOVERNANCE_MESSAGE_STATE_SENTINELS_MERKLE_ROOT message
        // is received but if a sentinel does not call solveChallenge we could enter in lock down mode even if there is an active sentinel/guardian

        emit GovernanceMessage(
            abi.encode(
                GOVERNANCE_MESSAGE_STATE_SENTINELS_MERKLE_ROOT,
                abi.encode(
                    currentEpoch,
                    MerkleTree.getRootByProofAndLeaf(keccak256(abi.encodePacked(address(0))), proof)
                )
            )
        );
    }
}
