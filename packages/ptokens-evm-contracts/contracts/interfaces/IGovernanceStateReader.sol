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
}
