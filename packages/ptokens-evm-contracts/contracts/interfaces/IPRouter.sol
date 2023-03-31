// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

/**
 * @title IPRouter
 * @author pNetwork
 *
 * @notice
 */
interface IPRouter {
    event UserOperation(
        uint256 nonce,
        string destinationAccount,
        bytes4 destinationNetworkId,
        string underlyingAssetName,
        string underlyingAssetSymbol,
        uint256 underlyingAssetDecimals,
        address underlyingAssetTokenAddress,
        bytes4 underlyingAssetNetworkId,
        address assetTokenAddress,
        uint256 assetAmount,
        bytes userData,
        bytes32 optionsMask
    );

    function userSend(
        string calldata destinationAccount,
        bytes4 destinationNetworkId,
        string calldata underlyingAssetName,
        string calldata underlyingAssetSymbol,
        uint256 underlyingAssetDecimals,
        address underlyingAssetTokenAddress,
        bytes4 underlyingAssetNetworkId,
        address assetTokenAddress,
        uint256 assetAmount,
        bytes calldata userData,
        bytes32 optionsMask
    ) external;
}
