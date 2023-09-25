// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {IPNetworkHub} from "./IPNetworkHub.sol";

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

    /**
     * @dev Emitted when guardians are emitted.
     *
     * @param epoch The epoch
     * @param guardians The guardians
     */
    event GuardiansPropagated(uint16 indexed epoch, address[] guardians);

    /**
     * @dev Emitted when sentinels are emitted.
     *
     * @param epoch The epoch
     * @param sentinels The sentinels
     */
    event SentinelsPropagated(uint16 indexed epoch, address[] sentinels);

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
     * @notice Emit a GovernanceMessage to cancel an operation on a given network
     *
     * @param operation
     * @param networkId
     */
    function protocolGovernanceCancelOperation(IPNetworkHub.Operation calldata operation, bytes4 networkId) external;

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
}
