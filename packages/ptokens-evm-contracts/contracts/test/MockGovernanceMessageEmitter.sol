// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IEpochsManager} from "@pnetwork-association/dao-v2-contracts/contracts/interfaces/IEpochsManager.sol";
import {IPNetworkHub} from "../interfaces/IPNetworkHub.sol";
import {MerkleTree} from "../libraries/MerkleTree.sol";

contract MockGovernanceMessageEmitter {
    bytes32 public constant GOVERNANCE_MESSAGE_ACTORS = keccak256("GOVERNANCE_MESSAGE_ACTORS");
    bytes32 public constant GOVERNANCE_MESSAGE_SLASH_ACTOR = keccak256("GOVERNANCE_MESSAGE_SLASH_ACTOR");
    bytes32 public constant GOVERNANCE_MESSAGE_RESUME_ACTOR = keccak256("GOVERNANCE_MESSAGE_RESUME_ACTOR");
    bytes32 public constant GOVERNANCE_MESSAGE_PROTOCOL_GOVERNANCE_CANCEL_OPERATION =
        keccak256("GOVERNANCE_MESSAGE_PROTOCOL_GOVERNANCE_CANCEL_OPERATION");

    address public immutable epochsManager;

    event GovernanceMessage(bytes data);

    constructor(address epochsManager_) {
        epochsManager = epochsManager_;
    }

    function resumeActor(address actor) external {
        emit GovernanceMessage(
            abi.encode(GOVERNANCE_MESSAGE_RESUME_ACTOR, abi.encode(IEpochsManager(epochsManager).currentEpoch(), actor))
        );
    }

    function slashActor(address actor) external {
        emit GovernanceMessage(
            abi.encode(GOVERNANCE_MESSAGE_SLASH_ACTOR, abi.encode(IEpochsManager(epochsManager).currentEpoch(), actor))
        );
    }

    function propagateActors(uint16 epoch, address[] calldata guardians, address[] calldata sentinels) external {
        address[] memory actors = new address[](guardians.length + sentinels.length);

        for (uint256 i = 0; i < guardians.length; ) {
            actors[i] = guardians[i];
            unchecked {
                ++i;
            }
        }

        for (uint256 i = guardians.length; i < guardians.length + sentinels.length; ) {
            actors[i] = sentinels[i - guardians.length];
            unchecked {
                ++i;
            }
        }

        emit GovernanceMessage(
            abi.encode(
                GOVERNANCE_MESSAGE_ACTORS,
                abi.encode(epoch, actors.length, MerkleTree.getRoot(_hashAddresses(actors)))
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
