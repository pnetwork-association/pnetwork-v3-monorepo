// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {MerkleTree} from "../libraries/MerkleTree.sol";

contract MockGovernanceStateReader {
    bytes32 public constant GOVERNANCE_MESSAGE_STATE_ACTORS = keccak256("GOVERNANCE_MESSAGE_STATE_ACTORS");

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
                GOVERNANCE_MESSAGE_STATE_ACTORS,
                abi.encode(
                    epoch,
                    sentinels.length,
                    MerkleTree.getRoot(sentinelsData),
                    guardians.length,
                    MerkleTree.getRoot(guardiansData)
                )
            )
        );
    }
}
