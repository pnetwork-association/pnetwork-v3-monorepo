// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IGovernanceStateReader} from "../interfaces/IGovernanceStateReader.sol";
import {IRegistrationManager} from "@pnetwork-association/dao-v2-contracts/contracts/interfaces/IRegistrationManager.sol";
import {ILendingManager} from "@pnetwork-association/dao-v2-contracts/contracts/interfaces/ILendingManager.sol";
import {IEpochsManager} from "@pnetwork-association/dao-v2-contracts/contracts/interfaces/IEpochsManager.sol";
import {MerkleTree} from "../libraries/MerkleTree.sol";

error InvalidAmount(uint256 amount, uint256 expectedAmount);
error InvalidGovernanceMessageVerifier(address governanceMessagerVerifier, address expectedGovernanceMessageVerifier);
error InvalidSentinelRegistration(bytes1 kind);

contract GovernanceStateReader is IGovernanceStateReader {
    address public constant LENDING_MANAGER = 0xa65e64ae3A3Ae4A7Ea11D7C2596De779C34dD6af;
    address public constant REGISTRATION_MANAGER = 0xCcdbBC9Dea73673dF74E1EE4D5faC8c6Ce1930ef;
    address public constant EPOCHS_MANAGER = 0xbA1067FB99Ad837F0e2895B57D1635Bdbefa789E;
    bytes32 public constant GOVERNANCE_MESSAGE_SENTINELS = keccak256("GOVERNANCE_MESSAGE_SENTINELS");

    /// @inheritdoc IGovernanceStateReader
    function propagateGuardians(address[] calldata guardians) external {
        // uint16 totalNumberOfGuardians = IRegistrationManager(REGISTRATION_MANAGER).totalNumberOfGuardians();
        // uint16 numberOfValidGuardians;
        // for (uint16 index = 0; i < guardians; ) {
        //     if (IRegistrationManager(REGISTRATION_MANAGER).isGuardian()) {
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
        // emit GovernanceMessage(
        //     abi.encode(GOVERNANCE_MESSAGE_GUARDIAN, MerkleTree.getRoot(data))
        // );
    }

    /// @inheritdoc IGovernanceStateReader
    function propagateSentinels(address[] calldata sentinels) external {
        // TODO: what does it happen in case of slashing?
        uint16 currentEpoch = IEpochsManager(EPOCHS_MANAGER).currentEpoch();
        uint32 totalBorrowedAmount = ILendingManager(LENDING_MANAGER).totalBorrowedAmountByEpoch(currentEpoch);
        uint256 totalSentinelStakedAmount = IRegistrationManager(REGISTRATION_MANAGER).totalSentinelStakedAmountByEpoch(
            currentEpoch
        );
        uint256 totalAmount = totalBorrowedAmount + totalSentinelStakedAmount;

        uint256 cumulativeAmount = 0;
        for (uint256 index; index < sentinels.length; ) {
            IRegistrationManager.Registration memory registration = IRegistrationManager(REGISTRATION_MANAGER)
                .sentinelRegistration(sentinels[index]);

            bytes1 registrationKind = registration.kind;
            if (registrationKind == 0x01) {
                cumulativeAmount += IRegistrationManager(REGISTRATION_MANAGER).sentinelStakedAmountByEpochOf(
                    sentinels[index],
                    currentEpoch
                );
            } else if (registrationKind == 0x02) {
                cumulativeAmount += 200000; // NOTE: we use the truncated amount
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

        bytes[] memory data = new bytes[](sentinels.length);
        for (uint256 i = 0; i < sentinels.length; i++) {
            data[i] = abi.encodePacked(sentinels[i]);
        }

        emit GovernanceMessage(
            abi.encode(GOVERNANCE_MESSAGE_SENTINELS, abi.encode(currentEpoch, MerkleTree.getRoot(data)))
        );
    }
}
