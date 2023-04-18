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

    address public immutable router;
    address public immutable stateManager;
    address public immutable underlyingAssetTokenAddress;
    bytes4 public immutable underlyingAssetNetworkId;
    uint256 private immutable _underlyingAssetDecimals;

    modifier onlyRouter() {
        if (_msgSender() != router) {
            revert Errors.SenderIsNotRouter();
        }
        _;
    }

    modifier onlyStateManager() {
        if (_msgSender() != stateManager) {
            revert Errors.SenderIsNotStateManager();
        }
        _;
    }

    constructor(
        string memory underlyingAssetName,
        string memory underlyingAssetSymbol,
        uint256 underlyingAssetDecimals,
        address _underlyingAssetTokenAddress,
        bytes4 _underlyingAssetNetworkId,
        address _router,
        address _stateManager
    ) ERC20(string.concat("p", underlyingAssetName), string.concat("p", underlyingAssetSymbol)) {
        if (Network.isCurrentNetwork(_underlyingAssetNetworkId)) {
            string memory expectedUnderlyingAssetName = IERC20Metadata(_underlyingAssetTokenAddress).name();
            if (
                keccak256(abi.encodePacked(underlyingAssetName)) !=
                keccak256(abi.encodePacked(expectedUnderlyingAssetName))
            ) {
                revert Errors.InvalidUnderlyingAssetName(underlyingAssetName, expectedUnderlyingAssetName);
            }

            string memory expectedUnderlyingAssetSymbol = IERC20Metadata(_underlyingAssetTokenAddress).symbol();
            if (
                keccak256(abi.encodePacked(underlyingAssetSymbol)) !=
                keccak256(abi.encodePacked(expectedUnderlyingAssetSymbol))
            ) {
                revert Errors.InvalidUnderlyingAssetSymbol(underlyingAssetName, expectedUnderlyingAssetName);
            }

            uint256 expectedUnderliyngAssetDecimals = IERC20Metadata(_underlyingAssetTokenAddress).decimals();
            if (underlyingAssetDecimals != expectedUnderliyngAssetDecimals || expectedUnderliyngAssetDecimals > 18) {
                revert Errors.InvalidUnderlyingAssetDecimals(underlyingAssetDecimals, expectedUnderliyngAssetDecimals);
            }
        }

        underlyingAssetNetworkId = _underlyingAssetNetworkId;
        underlyingAssetTokenAddress = _underlyingAssetTokenAddress;
        _underlyingAssetDecimals = underlyingAssetDecimals;
        router = _router;
        stateManager = _stateManager;
    }

    /// @inheritdoc IPToken
    function burn(uint256 amount) external {
        _burnAndRelease(_msgSender(), amount);
    }

    /// @inheritdoc IPToken
    function mint(uint256 amount) external {
        address account = _msgSender();
        _takeCollateral(account, amount);
        uint256 effectiveAmount = Utils.normalizeAmount(amount, _underlyingAssetDecimals, true);
        _mint(account, effectiveAmount);
    }

    /// @inheritdoc IPToken
    function routedUserMint(address account, uint256 amount) external onlyRouter {
        _takeCollateral(account, amount);
        uint256 effectiveAmount = Utils.normalizeAmount(amount, _underlyingAssetDecimals, true);
        _mint(account, effectiveAmount);
    }

    /// @inheritdoc IPToken
    function routedUserMintAndBurn(address account, uint256 amount) external onlyRouter {
        _takeCollateral(account, amount);
        uint256 effectiveAmount = Utils.normalizeAmount(amount, _underlyingAssetDecimals, true);
        emit Transfer(address(0), account, effectiveAmount);
        emit Transfer(account, address(0), effectiveAmount);
    }

    /// @inheritdoc IPToken
    function routedUserBurn(address account, uint256 amount) external onlyRouter {
        _burn(account, amount);
    }

    /// @inheritdoc IPToken
    function stateManagedProtocolMint(address account, uint256 amount) external onlyStateManager {
        uint256 effectiveAmount = Utils.normalizeAmount(amount, _underlyingAssetDecimals, true);
        _mint(account, effectiveAmount);
    }

    /// @inheritdoc IPToken
    function stateManagedProtocolBurn(address account, uint256 amount) external onlyStateManager {
        _burnAndRelease(account, amount);
    }

    function _takeCollateral(address account, uint256 amount) internal {
        if (!Network.isCurrentNetwork(underlyingAssetNetworkId)) revert Errors.InvalidNetwork(underlyingAssetNetworkId);
        IERC20Metadata(underlyingAssetTokenAddress).safeTransferFrom(account, address(this), amount);
    }

    function _burnAndRelease(address account, uint256 amount) internal {
        if (!Network.isCurrentNetwork(underlyingAssetNetworkId)) revert Errors.InvalidNetwork(underlyingAssetNetworkId);
        _burn(account, amount);
        uint256 effectiveAmount = Utils.normalizeAmount(amount, _underlyingAssetDecimals, false);
        IERC20Metadata(underlyingAssetTokenAddress).safeTransfer(account, effectiveAmount);
    }
}
