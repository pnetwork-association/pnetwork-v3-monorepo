// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

/**
 * @title IPToken
 * @author pNetwork
 *
 * @notice
 */
interface IPToken {
    /*
     * @notice Mint the corresponding `amount` of pToken through the PRouter to `account`.
     *
     * @param account
     * @param amount
     */
    function routedUserMint(address account, uint256 amount) external;

    function routedUserMintAndBurn(address account, uint256 amount) external;

    function routedUserBurn(address account, uint256 amount) external;

    function stateManagedProtocolMint(address account, uint256 amount) external;

    function stateManagedProtocolBurn(address account, uint256 amount) external;
}
