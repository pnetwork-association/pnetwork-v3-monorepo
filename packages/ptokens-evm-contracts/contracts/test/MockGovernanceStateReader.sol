// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {MerkleTree} from "../libraries/MerkleTree.sol";

contract MockGovernanceStateReader {
    bytes32 public constant GOVERNANCE_MESSAGE_STATE_GUARDIANS = keccak256("GOVERNANCE_MESSAGE_STATE_GUARDIANS");
    bytes32 public constant GOVERNANCE_MESSAGE_STATE_SENTINELS = keccak256("GOVERNANCE_MESSAGE_STATE_SENTINELS");

    event GovernanceMessage(bytes data);

    function propagateActors(uint16 epoch, address[] calldata sentinels, address[] calldata guardians) external {
        bytes[] memory sentinelsData = new bytes[](sentinels.length);
        for (uint256 i = 0; i < sentinels.length; i++) {
            sentinelsData[i] = abi.encodePacked(sentinels[i]);
        }

        bytes[] memory guardiansData = new bytes[](guardians.length);
        for (uint256 i = 0; i < guardians.length; i++) {
            guardiansData[i] = abi.encodePacked(guardians[i]);
        }

        emit GovernanceMessage(
            abi.encode(
                GOVERNANCE_MESSAGE_STATE_SENTINELS,
                abi.encode(epoch, sentinels.length, MerkleTree.getRoot(sentinelsData))
            )
        );

        emit GovernanceMessage(
            abi.encode(
                GOVERNANCE_MESSAGE_STATE_GUARDIANS,
                abi.encode(epoch, guardians.length, MerkleTree.getRoot(guardiansData))
            )
        );
    }
}
