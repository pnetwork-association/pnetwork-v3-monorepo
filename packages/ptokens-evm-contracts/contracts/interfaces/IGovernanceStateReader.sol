// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

/**
 * @title IGovernanceStateReader
 * @author pNetwork
 *
 * @notice
 */

interface IGovernanceStateReader {
    /**
     * @dev Emitted when a governance message must be propagated on the other chains
     *
     * @param data The data
     */
    event GovernanceMessage(bytes data);

    /*
     * @notice Emit a GovernanceMessage event containing the total number of sentinels, the sentinels merkle root, the total number of guardians and
     *         the guardians merkle root for the current epoch. This message will be verified by GovernanceMessageVerifier.
     *
     * @param sentinels
     * @param guardians
     */
    function propagateActors(address[] calldata sentinels, address[] calldata guardians) external;
}
