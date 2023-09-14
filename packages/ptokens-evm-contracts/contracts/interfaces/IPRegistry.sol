// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

interface IPRegistry {
  /*
   * @dev Return true if the given network id has been registered on pNetwork
   *
   * @param networkId the network ID
   *
   * @return bool true or false
   */
  function isNetworkIdSupported(bytes4 networkId) external view returns (bool);


  /**
   * @dev Returns the pNetwork hub address for the given network ID
   *
   * @param sourceNetworkId a network ID
   *
   * @return address pNetwork hub address on the given network ID
   */
  function hubByNetworkId(bytes4 sourceNetworkId) external view returns (address);
}