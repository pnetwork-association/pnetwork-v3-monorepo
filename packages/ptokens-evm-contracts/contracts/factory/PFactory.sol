// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {PToken} from "../core/PToken.sol";
import {IPFactory} from "../interfaces/IPFactory.sol";

contract PFactory is IPFactory, Ownable {
    address public router;
    address public stateManager;

    function deploy(
        string memory underlyingAssetName,
        string memory underlyingAssetSymbol,
        uint256 underlyingAssetDecimals,
        address underlyingAssetTokenAddress,
        bytes4 underlyingAssetNetworkId
    ) public payable returns (address) {
        address pTokenAddress = address(
            new PToken{salt: hex"0000000000000000000000000000000000000000000000000000000000000000"}(
                underlyingAssetName,
                underlyingAssetSymbol,
                underlyingAssetDecimals,
                underlyingAssetTokenAddress,
                underlyingAssetNetworkId,
                router,
                stateManager
            )
        );

        emit PTokenDeployed(pTokenAddress);
        return pTokenAddress;
    }

    function getBytecode(
        string memory underlyingAssetName,
        string memory underlyingAssetSymbol,
        uint256 underlyingAssetDecimals,
        address underlyingAssetTokenAddress,
        bytes4 underlyingAssetNetworkId
    ) public view returns (bytes memory) {
        bytes memory bytecode = type(PToken).creationCode;

        return
            abi.encodePacked(
                bytecode,
                abi.encode(
                    underlyingAssetName,
                    underlyingAssetSymbol,
                    underlyingAssetDecimals,
                    underlyingAssetTokenAddress,
                    underlyingAssetNetworkId,
                    router,
                    stateManager
                )
            );
    }

    function getPTokenAddress(
        string memory underlyingAssetName,
        string memory underlyingAssetSymbol,
        uint256 underlyingAssetDecimals,
        address underlyingAssetTokenAddress,
        bytes4 underlyingAssetNetworkId
    ) public view returns (address) {
        bytes memory bytecode = getBytecode(
            underlyingAssetName,
            underlyingAssetSymbol,
            underlyingAssetDecimals,
            underlyingAssetTokenAddress,
            underlyingAssetNetworkId
        );

        return
            address(
                uint160(
                    uint256(
                        keccak256(
                            abi.encodePacked(
                                bytes1(0xff),
                                address(this),
                                hex"0000000000000000000000000000000000000000000000000000000000000000",
                                keccak256(bytecode)
                            )
                        )
                    )
                )
            );
    }

    function setRouter(address _router) external onlyOwner {
        router = _router;
    }

    function setStateManager(address _stateManager) external onlyOwner {
        stateManager = _stateManager;
    }
}
