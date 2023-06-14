// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

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
     * @notice Emit a GovernanceMessage event containing the guardians merkle root. This message will
     *         be verified by GovernanceMessageVerifier.
     *
     * @param guardians
     */
    function propagateGuardians(address[] calldata guardians) external;

    /*
     * @notice Emit a GovernanceMessage event containing the sentinels merkle root for the current epoch. This message will
     *         be verified by GovernanceMessageVerifier.
     *
     * @param sentinels
     */
    function propagateSentinels(address[] calldata sentinels) external;
}
