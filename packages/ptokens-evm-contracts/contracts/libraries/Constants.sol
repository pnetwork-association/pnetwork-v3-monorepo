// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

library Constants {
    bytes32 public constant GOVERNANCE_MESSAGE_SENTINELS = keccak256("GOVERNANCE_MESSAGE_SENTINELS");
    uint256 public constant FEE_BASIS_POINTS_DIVISOR = 10000;
}
