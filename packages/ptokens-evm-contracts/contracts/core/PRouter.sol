// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {IPRouter} from "../interfaces/IPRouter.sol";
import {IPToken} from "../interfaces/IPToken.sol";
import {IPFactory} from "../interfaces/IPFactory.sol";
import {Network} from "../libraries/Network.sol";
import {Roles} from "../libraries/Roles.sol";
import {Errors} from "../libraries/Errors.sol";

contract PRouter is IPRouter, Context {
    address public immutable factory;

    constructor(address _factory) {
        factory = _factory;
    }

    /// @inheritdoc IPRouter
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
    ) external {
        if (
            (assetAmount > 0 && assetTokenAddress == address(0)) ||
            (assetAmount == 0 && assetTokenAddress != address(0))
        ) {
            revert Errors.InvalidAssetParameters(assetAmount, assetTokenAddress);
        }

        if (assetAmount > 0) {
            address pTokenAddress = IPFactory(factory).getPTokenAddress(
                underlyingAssetName,
                underlyingAssetSymbol,
                underlyingAssetDecimals,
                underlyingAssetTokenAddress,
                underlyingAssetNetworkId
            );

            if (pTokenAddress.code.length == 0) {
                revert Errors.PTokenNotCreated(pTokenAddress);
            }

            address msgSender = _msgSender();

            if (underlyingAssetTokenAddress == assetTokenAddress && Network.isCurrentNetwork(destinationNetworkId)) {
                IPToken(pTokenAddress).routedUserMint(msgSender, assetAmount);
            } else if (
                underlyingAssetTokenAddress == assetTokenAddress && !Network.isCurrentNetwork(destinationNetworkId)
            ) {
                IPToken(pTokenAddress).routedUserMintAndBurn(msgSender, assetAmount);
            } else if (pTokenAddress == assetTokenAddress && !Network.isCurrentNetwork(destinationNetworkId)) {
                IPToken(pTokenAddress).routedUserBurn(msgSender, assetAmount);
            } else if (pTokenAddress == assetTokenAddress && Network.isCurrentNetwork(destinationNetworkId)) {
                IPToken(pTokenAddress).burn(assetAmount);
            } else {
                revert Errors.InvalidUserOperation();
            }
        } else if (userData.length == 0) {
            revert Errors.NoUserOperation();
        }

        emit UserOperation(
            gasleft(),
            destinationAccount,
            destinationNetworkId,
            underlyingAssetName,
            underlyingAssetSymbol,
            underlyingAssetDecimals,
            underlyingAssetTokenAddress,
            underlyingAssetNetworkId,
            assetTokenAddress,
            assetAmount,
            userData,
            optionsMask
        );
    }
}
