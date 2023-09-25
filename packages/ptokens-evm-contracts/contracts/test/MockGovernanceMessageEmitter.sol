// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IEpochsManager} from "@pnetwork-association/dao-v2-contracts/contracts/interfaces/IEpochsManager.sol";
import {IPNetworkHub} from "../interfaces/IPNetworkHub.sol";
import {MerkleTree} from "../libraries/MerkleTree.sol";

contract MockGovernanceMessageEmitter {
    bytes32 public constant GOVERNANCE_MESSAGE_SENTINELS = keccak256("GOVERNANCE_MESSAGE_SENTINELS");
    bytes32 public constant GOVERNANCE_MESSAGE_GUARDIANS = keccak256("GOVERNANCE_MESSAGE_GUARDIANS");
    bytes32 public constant GOVERNANCE_MESSAGE_SLASH_SENTINEL = keccak256("GOVERNANCE_MESSAGE_SLASH_SENTINEL");
    bytes32 public constant GOVERNANCE_MESSAGE_SLASH_GUARDIAN = keccak256("GOVERNANCE_MESSAGE_SLASH_GUARDIAN");
    bytes32 public constant GOVERNANCE_MESSAGE_RESUME_SENTINEL = keccak256("GOVERNANCE_MESSAGE_RESUME_SENTINEL");
    bytes32 public constant GOVERNANCE_MESSAGE_RESUME_GUARDIAN = keccak256("GOVERNANCE_MESSAGE_RESUME_GUARDIAN");
    bytes32 public constant GOVERNANCE_MESSAGE_PROTOCOL_GOVERNANCE_CANCEL_OPERATION =
        keccak256("GOVERNANCE_MESSAGE_PROTOCOL_GOVERNANCE_CANCEL_OPERATION");

    address public immutable epochsManager;

    event GovernanceMessage(bytes data);

    constructor(address epochsManager_) {
        epochsManager = epochsManager_;
    }

    function resumeGuardian(address guardian) external {
        emit GovernanceMessage(
            abi.encode(
                GOVERNANCE_MESSAGE_RESUME_GUARDIAN,
                abi.encode(IEpochsManager(epochsManager).currentEpoch(), guardian)
            )
        );
    }

    function resumeSentinel(address sentinel) external {
        emit GovernanceMessage(
            abi.encode(
                GOVERNANCE_MESSAGE_RESUME_SENTINEL,
                abi.encode(IEpochsManager(epochsManager).currentEpoch(), sentinel)
            )
        );
    }

    function slashGuardian(address guardian) external {
        emit GovernanceMessage(
            abi.encode(
                GOVERNANCE_MESSAGE_SLASH_GUARDIAN,
                abi.encode(IEpochsManager(epochsManager).currentEpoch(), guardian)
            )
        );
    }

    function slashSentinel(address sentinel) external {
        emit GovernanceMessage(
            abi.encode(
                GOVERNANCE_MESSAGE_SLASH_SENTINEL,
                abi.encode(IEpochsManager(epochsManager).currentEpoch(), sentinel)
            )
        );
    }

    function propagateActors(uint16 epoch, address[] calldata sentinels, address[] calldata guardians) external {
        emit GovernanceMessage(
            abi.encode(
                GOVERNANCE_MESSAGE_SENTINELS,
                abi.encode(epoch, sentinels.length, MerkleTree.getRoot(_hashAddresses(sentinels)))
            )
        );

        emit GovernanceMessage(
            abi.encode(
                GOVERNANCE_MESSAGE_GUARDIANS,
                abi.encode(epoch, guardians.length, MerkleTree.getRoot(_hashAddresses(guardians)))
            )
        );
    }

    function protocolGovernanceCancelOperation(IPNetworkHub.Operation calldata operation) external {
        emit GovernanceMessage(
            abi.encode(GOVERNANCE_MESSAGE_PROTOCOL_GOVERNANCE_CANCEL_OPERATION, abi.encode(operation))
        );
    }

    function _hashAddresses(address[] memory addresses) internal pure returns (bytes32[] memory) {
        bytes32[] memory data = new bytes32[](addresses.length);
        for (uint256 i = 0; i < addresses.length; i++) {
            data[i] = keccak256(abi.encodePacked(addresses[i]));
        }
        return data;
    }
}
