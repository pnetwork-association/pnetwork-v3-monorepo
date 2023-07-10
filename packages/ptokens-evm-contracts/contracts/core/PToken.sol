// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IPToken} from "../interfaces/IPToken.sol";
import {Utils} from "../libraries/Utils.sol";
import {Network} from "../libraries/Network.sol";
import {Errors} from "../libraries/Errors.sol";

contract PToken is IPToken, ERC20 {
    using SafeERC20 for IERC20Metadata;

    address public immutable hub;
    address public immutable underlyingAssetTokenAddress;
    bytes4 public immutable underlyingAssetNetworkId;
    uint256 private immutable _underlyingAssetDecimals;

    modifier onlyHub() {
        if (_msgSender() != hub) {
            revert Errors.SenderIsNotHub();
        }
        _;
    }

    constructor(
        string memory underlyingAssetName,
        string memory underlyingAssetSymbol,
        uint256 underlyingAssetDecimals,
        address underlyingAssetTokenAddress_,
        bytes4 underlyingAssetNetworkId_,
        address hub_
    ) ERC20(string.concat("p", underlyingAssetName), string.concat("p", underlyingAssetSymbol)) {
        if (Network.isCurrentNetwork(underlyingAssetNetworkId_)) {
            string memory expectedUnderlyingAssetName = IERC20Metadata(underlyingAssetTokenAddress_).name();
            if (
                keccak256(abi.encodePacked(underlyingAssetName)) !=
                keccak256(abi.encodePacked(expectedUnderlyingAssetName))
            ) {
                revert Errors.InvalidUnderlyingAssetName(underlyingAssetName, expectedUnderlyingAssetName);
            }

            string memory expectedUnderlyingAssetSymbol = IERC20Metadata(underlyingAssetTokenAddress_).symbol();
            if (
                keccak256(abi.encodePacked(underlyingAssetSymbol)) !=
                keccak256(abi.encodePacked(expectedUnderlyingAssetSymbol))
            ) {
                revert Errors.InvalidUnderlyingAssetSymbol(underlyingAssetName, expectedUnderlyingAssetName);
            }

            uint256 expectedUnderliyngAssetDecimals = IERC20Metadata(underlyingAssetTokenAddress_).decimals();
            if (underlyingAssetDecimals != expectedUnderliyngAssetDecimals || expectedUnderliyngAssetDecimals > 18) {
                revert Errors.InvalidUnderlyingAssetDecimals(underlyingAssetDecimals, expectedUnderliyngAssetDecimals);
            }
        }

        underlyingAssetNetworkId = underlyingAssetNetworkId_;
        underlyingAssetTokenAddress = underlyingAssetTokenAddress_;
        _underlyingAssetDecimals = underlyingAssetDecimals;
        hub = hub_;
    }

    /// @inheritdoc IPToken
    function burn(uint256 amount) external {
        _burnAndReleaseCollateral(_msgSender(), amount);
    }

    /// @inheritdoc IPToken
    function mint(uint256 amount) external {
        _takeCollateralAndMint(_msgSender(), amount);
    }

    /// @inheritdoc IPToken
    function protocolMint(address account, uint256 amount) external onlyHub {
        _mint(account, amount);
    }

    /// @inheritdoc IPToken
    function protocolBurn(address account, uint256 amount) external onlyHub {
        _burnAndReleaseCollateral(account, amount);
    }

    /// @inheritdoc IPToken
    function userMint(address account, uint256 amount) external onlyHub {
        _takeCollateralAndMint(account, amount);
    }

    /// @inheritdoc IPToken
    function userMintAndBurn(address account, uint256 amount) external onlyHub {
        _takeCollateral(account, amount);
        uint256 normalizedAmount = Utils.normalizeAmount(amount, _underlyingAssetDecimals, true);
        emit Transfer(address(0), account, normalizedAmount);
        emit Transfer(account, address(0), normalizedAmount);
    }

    /// @inheritdoc IPToken
    function userBurn(address account, uint256 amount) external onlyHub {
        _burn(account, amount);
    }

    function _burnAndReleaseCollateral(address account, uint256 amount) internal {
        if (!Network.isCurrentNetwork(underlyingAssetNetworkId)) revert Errors.InvalidNetwork(underlyingAssetNetworkId);
        _burn(account, amount);
        IERC20Metadata(underlyingAssetTokenAddress).safeTransfer(
            account,
            Utils.normalizeAmount(amount, _underlyingAssetDecimals, false)
        );
    }

    function _takeCollateral(address account, uint256 amount) internal {
        if (!Network.isCurrentNetwork(underlyingAssetNetworkId)) revert Errors.InvalidNetwork(underlyingAssetNetworkId);
        IERC20Metadata(underlyingAssetTokenAddress).safeTransferFrom(account, address(this), amount);
    }

    function _takeCollateralAndMint(address account, uint256 amount) internal {
        _takeCollateral(account, amount);
        _mint(account, Utils.normalizeAmount(amount, _underlyingAssetDecimals, true));
    }
}
