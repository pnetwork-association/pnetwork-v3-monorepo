// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

interface IPRegistry {
  function isNetworkIdSupported(bytes4 networkId) external view returns (bool);
  function hubByNetworkId(bytes4 sourceNetworkId) external view returns (address);
}