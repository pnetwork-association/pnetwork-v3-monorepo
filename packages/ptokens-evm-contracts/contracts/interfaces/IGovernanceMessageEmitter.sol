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

    /*
     * @notice Emit a GovernanceMessage event containing ONLY the sentinels merkle root
     *         with a leaf that should be proved by the proof set to 0.
     *         This function is meant to be called by the RegistrationManager which,
     *         should make inactive a sentinel after having slashed a it and its amount at stake
     *         has become < 200k PNT
     *
     * @param sentinels
     * @param guardians
     */
    function propagateSentinelsByRemovingTheLeafByProof(bytes32[] calldata proof) external;
}
