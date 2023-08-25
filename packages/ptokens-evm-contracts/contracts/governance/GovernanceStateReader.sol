// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IGovernanceStateReader} from "../interfaces/IGovernanceStateReader.sol";
import {IRegistrationManager} from "@pnetwork-association/dao-v2-contracts/contracts/interfaces/IRegistrationManager.sol";
import {ILendingManager} from "@pnetwork-association/dao-v2-contracts/contracts/interfaces/ILendingManager.sol";
import {IEpochsManager} from "@pnetwork-association/dao-v2-contracts/contracts/interfaces/IEpochsManager.sol";
import {MerkleTree} from "../libraries/MerkleTree.sol";
import "hardhat/console.sol";

error InvalidAmount(uint256 amount, uint256 expectedAmount);
error InvalidGovernanceMessageVerifier(address governanceMessagerVerifier, address expectedGovernanceMessageVerifier);
error InvalidSentinelRegistration(bytes1 kind);

contract GovernanceStateReader is IGovernanceStateReader {
    bytes32 public constant GOVERNANCE_MESSAGE_STATE_SENTINELS = keccak256("GOVERNANCE_MESSAGE_STATE_SENTINELS");
    bytes32 public constant GOVERNANCE_MESSAGE_STATE_GUARDIANS = keccak256("GOVERNANCE_MESSAGE_STATE_GUARDIANS");

    address public immutable epochsManager;
    address public immutable lendingManager;
    address public immutable registrationManager;

    constructor(address epochsManager_, address lendingManager_, address registrationManager_) {
        epochsManager = epochsManager_;
        lendingManager = lendingManager_;
        registrationManager = registrationManager_;
    }

    /// @inheritdoc IGovernanceStateReader
    function propagateActors(address[] calldata sentinels, address[] calldata guardians) external {
        propagateSentinels(sentinels);
        propagateGuardians(guardians);
    }

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

        bytes[] memory data = new bytes[](guardians.length);
        for (uint256 i = 0; i < guardians.length; i++) {
            data[i] = abi.encodePacked(guardians[i]);
        }

        emit GovernanceMessage(
            abi.encode(
                GOVERNANCE_MESSAGE_STATE_GUARDIANS,
                abi.encode(currentEpoch, guardians.length, MerkleTree.getRoot(data))
            )
        );
    }

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

        bytes[] memory data = new bytes[](effectiveSentinels.length);
        for (uint256 i = 0; i < effectiveSentinels.length; i++) {
            console.log(effectiveSentinels[i]);
            data[i] = abi.encodePacked(effectiveSentinels[i]);
        }

        emit GovernanceMessage(
            abi.encode(
                GOVERNANCE_MESSAGE_STATE_SENTINELS,
                abi.encode(currentEpoch, effectiveSentinels.length, MerkleTree.getRoot(data))
            )
        );
    }
}
