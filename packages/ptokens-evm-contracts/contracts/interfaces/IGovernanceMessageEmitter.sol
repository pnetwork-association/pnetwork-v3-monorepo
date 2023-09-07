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
     * @notice Emit a GovernanceMessage event containing the address of the hard-resumed sentinel.
     *
     * @param sentinel
     * @param sentinels
     */
    function hardResumeSentinel(address sentinel, address[] calldata sentinels) external;

    /*
     * @notice Emit a GovernanceMessage event containing the guardians merkle root (without the slashed guardian) and the guardian address
     *
     * @param sentinel
     * @param proof
     */
    function hardSlashGuardian(address guardian, bytes32[] calldata proof) external;

    /*
     * @notice Emit a GovernanceMessage event containing the sentinels merkle root (without the slashed sentinel) and the sentinel address
     *
     * @param sentinel
     * @param proof
     */
    function hardSlashSentinel(address sentinel, bytes32[] calldata proof) external;

    /*
     * @notice Emit a GovernanceMessage event containing the address of the light-resumed guardian
     *
     * @param guardian
     */
    function lightResumeGuardian(address guardian) external;

    /*
     * @notice Emit a GovernanceMessage event containing the address of the light-resumed sentinel
     *
     * @param guardian
     */
    function lightResumeSentinel(address sentinel) external;

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
