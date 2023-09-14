// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

/**
 * @title IRegistrationManager
 * @author pNetwork
 *
 * @notice
 */
interface IRegistrationManager {
    /*
     * @notice Slash a sentinel or a guardian. This function is callable only by the PNetworkHub
     *
     * @param actor
     * @param proof
     * @param amount
     * @param challenger
     *
     */
    function slash(address owner, uint256 amount, address receiver) external;
}
