// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

/**
 * @title IGovernanceMessageEmitter
 * @author pNetwork
 *
 * @notice
 */

interface IGovernanceMessageEmitter {
    /**
     * @dev Emitted when a governance message must be propagated on the other chains
     *
     * @param data The data
     */
    event GovernanceMessage(bytes data);

    /*
     * @notice Emit a GovernanceMessage event containing the address of the resumed guardian
     *
     * @param guardian
     */
    function resumeGuardian(address guardian) external;

    /*
     * @notice Emit a GovernanceMessage event containing the address of the resumed sentinel
     *
     * @param guardian
     */
    function resumeSentinel(address sentinel) external;

    /*
     * @notice Emit a GovernanceMessage event containing the address of the slashed guardian
     *
     * @param guardian
     */
    function slashGuardian(address guardian) external;

    /*
     * @notice Emit a GovernanceMessage event containing the address of the slashed sentinel
     *
     * @param sentinel
     */
    function slashSentinel(address sentinel) external;

    /*
     * @notice Just call propagateGuardians and propagateSentinels
     *
     * @param sentinels
     * @param guardians
     */
    function propagateActors(address[] calldata sentinels, address[] calldata guardians) external;

    /*
     * @notice Emit a GovernanceMessage event containing the total number of guardians and
     *         the guardians merkle root for the current epoch. This message will be verified by GovernanceMessageVerifier.
     *
     * @param guardians
     */
    function propagateGuardians(address[] calldata guardians) external;

    /*
     * @notice Emit a GovernanceMessage event containing the total number of sentinels, the sentinels merkle root
     *      for the current epoch. This message will be verified by GovernanceMessageVerifier.
     *
     * @param sentinels
     * @param guardians
     */
    function propagateSentinels(address[] calldata sentinels) external;
}
