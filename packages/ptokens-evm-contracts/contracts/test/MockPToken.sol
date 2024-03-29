// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {PToken} from "../core/PToken.sol";

contract MockPToken is PToken {
    constructor(
        string memory underlyingAssetName,
        string memory underlyingAssetSymbol,
        uint256 underlyingAssetDecimals,
        address underlyingAssetTokenAddress,
        bytes4 underlyingAssetNetworkId,
        address hub
    )
        PToken(
            underlyingAssetName,
            underlyingAssetSymbol,
            underlyingAssetDecimals,
            underlyingAssetTokenAddress,
            underlyingAssetNetworkId,
            hub
        )
    {}

    function mockMint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
