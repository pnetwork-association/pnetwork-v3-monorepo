// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IGovernanceMessageEmitter} from "../interfaces/IGovernanceMessageEmitter.sol";
import {IRegistrationManager} from "@pnetwork-association/dao-v2-contracts/contracts/interfaces/IRegistrationManager.sol";
import {ILendingManager} from "@pnetwork-association/dao-v2-contracts/contracts/interfaces/ILendingManager.sol";
import {IEpochsManager} from "@pnetwork-association/dao-v2-contracts/contracts/interfaces/IEpochsManager.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {MerkleTree} from "../libraries/MerkleTree.sol";

error InvalidAmount(uint256 amount, uint256 expectedAmount);
error InvalidGovernanceMessageVerifier(address governanceMessagerVerifier, address expectedGovernanceMessageVerifier);
error InvalidSentinelRegistration(bytes1 kind);
error NotRegistrationManager();

contract GovernanceMessageEmitter is IGovernanceMessageEmitter {
    bytes32 public constant GOVERNANCE_MESSAGE_SENTINELS = keccak256("GOVERNANCE_MESSAGE_SENTINELS");
    bytes32 public constant GOVERNANCE_MESSAGE_HARD_SLASH_SENTINEL =
        keccak256("GOVERNANCE_MESSAGE_HARD_SLASH_SENTINEL");
    bytes32 public constant GOVERNANCE_MESSAGE_GUARDIANS = keccak256("GOVERNANCE_MESSAGE_GUARDIANS");
    bytes32 public constant GOVERNANCE_MESSAGE_LIGHT_RESUME_SENTINEL =
        keccak256("GOVERNANCE_MESSAGE_LIGHT_RESUME_SENTINEL");
    bytes32 public constant GOVERNANCE_MESSAGE_LIGHT_RESUME_GUARDIAN =
        keccak256("GOVERNANCE_MESSAGE_LIGHT_RESUME_GUARDIAN");
    bytes32 public constant GOVERNANCE_MESSAGE_HARD_RESUME_SENTINEL =
        keccak256("GOVERNANCE_MESSAGE_HARD_RESUME_SENTINEL");

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

    /// @inheritdoc IGovernanceMessageEmitter
    function hardResumeSentinel(address sentinel, address[] calldata sentinels) external onlyRegistrationManager {
        uint16 currentEpoch = IEpochsManager(epochsManager).currentEpoch();
        address[] memory effectiveSentinels = _filterSentinels(sentinels, currentEpoch);

        // TODO: What does it happen if effectiveSentinels.length === 1?
        emit GovernanceMessage(
            abi.encode(
                GOVERNANCE_MESSAGE_HARD_RESUME_SENTINEL,
                abi.encode(currentEpoch, sentinel, MerkleTree.getRoot(_hashAddresses(effectiveSentinels)))
            )
        );
    }

    /// @inheritdoc IGovernanceMessageEmitter
    function hardSlashSentinel(address sentinel, bytes32[] calldata proof) external onlyRegistrationManager {
        // NOTE: Should we prove that sentinel belongs to the proof? nope because this function can be called
        // only be the RegistrationManager.slash which can be called only by the PNetworkHub when executeOperation.
        // Moreover the operation that triggered the slashing contains the verification of the fact that the sentinel and
        // the proof belongs to the correct merkle root.
        emit GovernanceMessage(
            abi.encode(
                GOVERNANCE_MESSAGE_HARD_SLASH_SENTINEL,
                abi.encode(
                    IEpochsManager(epochsManager).currentEpoch(),
                    sentinel,
                    MerkleTree.getRootByProofAndLeaf(keccak256(abi.encodePacked(address(0))), proof)
                )
            )
        );
    }

    /// @inheritdoc IGovernanceMessageEmitter
    function lightResumeGuardian(address guardian) external onlyRegistrationManager {
        emit GovernanceMessage(
            abi.encode(
                GOVERNANCE_MESSAGE_LIGHT_RESUME_GUARDIAN,
                abi.encode(IEpochsManager(epochsManager).currentEpoch(), guardian)
            )
        );
    }

    /// @inheritdoc IGovernanceMessageEmitter
    function lightResumeSentinel(address sentinel) external onlyRegistrationManager {
        emit GovernanceMessage(
            abi.encode(
                GOVERNANCE_MESSAGE_LIGHT_RESUME_SENTINEL,
                abi.encode(IEpochsManager(epochsManager).currentEpoch(), sentinel)
            )
        );
    }

    /// @inheritdoc IGovernanceMessageEmitter
    function propagateActors(address[] calldata sentinels, address[] calldata guardians) external {
        propagateSentinels(sentinels);
        propagateGuardians(guardians);
    }

    /// @inheritdoc IGovernanceMessageEmitter
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

        // TODO: What does it happen if guardians.length === 1?
        emit GovernanceMessage(
            abi.encode(
                GOVERNANCE_MESSAGE_GUARDIANS,
                abi.encode(currentEpoch, guardians.length, MerkleTree.getRoot(_hashAddresses(guardians)))
            )
        );
    }

    /// @inheritdoc IGovernanceMessageEmitter
    function propagateSentinels(address[] calldata sentinels) public {
        uint16 currentEpoch = IEpochsManager(epochsManager).currentEpoch();
        address[] memory effectiveSentinels = _filterSentinels(sentinels, currentEpoch);

        // TODO: What does it happen if effectiveSentinels.length === 1?
        emit GovernanceMessage(
            abi.encode(
                GOVERNANCE_MESSAGE_SENTINELS,
                abi.encode(
                    currentEpoch,
                    effectiveSentinels.length,
                    MerkleTree.getRoot(_hashAddresses(effectiveSentinels))
                )
            )
        );
    }

    function _filterSentinels(
        address[] memory sentinels,
        uint16 currentEpoch
    ) internal view returns (address[] memory) {
        uint32 totalBorrowedAmount = ILendingManager(lendingManager).totalBorrowedAmountByEpoch(currentEpoch);
        uint256 totalSentinelStakedAmount = IRegistrationManager(registrationManager).totalSentinelStakedAmountByEpoch(
            currentEpoch
        );
        uint256 totalAmount = totalBorrowedAmount + totalSentinelStakedAmount;
        address[] memory effectiveSentinels = new address[](sentinels.length);
        uint256 cumulativeAmount = 0;

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

                effectiveSentinels[index] = amount >= 200000 ? sentinels[index] : address(0);
            } else if (registrationKind == 0x02) {
                cumulativeAmount += 200000;
                effectiveSentinels[index] = sentinels[index];
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

        return effectiveSentinels;
    }

    function _hashAddresses(address[] memory addresses) internal pure returns (bytes32[] memory) {
        bytes32[] memory data = new bytes32[](addresses.length);
        for (uint256 i = 0; i < addresses.length; i++) {
            data[i] = keccak256(abi.encodePacked(addresses[i]));
        }
        return data;
    }
}
