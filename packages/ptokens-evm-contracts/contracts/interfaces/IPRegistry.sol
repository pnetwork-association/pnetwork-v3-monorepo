// SPDX-License-Identifier: MIT

/**
 * Created on 2023-09-15 14:48
 * @summary:
 * @author: mauro
 */
pragma solidity ^0.8.19;

interface IPRegistry {
  /*
   * @dev Add a new entry for the map network ID => hub
   *
   * @param networkId the network ID
   * @param hub pNetwork hub contract address
   */
  function addProtocolBlockchain(uint32 chainId, address hub) external;

  /*
   * @dev Return true if the given network id has been registered on pNetwork
   *
   * @param networkId the network ID
   *
   * @return bool true or false
   */
  function isNetworkIdSupported(bytes4 networkId) external view returns (bool);

  /**
   * @dev Return the supported chain ID
   * @param chainId the chain id
   */
  function isChainIdSupported(uint32 chainId) external view returns (bool);

  /**
   * @dev Return the supported hubs
   */
  function getSupportedHubs() external view returns (address[] memory);

  /**
   * @dev Return the supported chain IDs
   * @return uint32[] the array of supported chain ids
   */
  function getSupportedChainIds() external view returns (uint32[] memory);

  /**
   * @dev Returns the pNetwork hub address for the given network ID
   *
   * @param sourceNetworkId a network ID
   *
   * @return address pNetwork hub address on the given network ID
   */
  function getHubByNetworkId(bytes4 sourceNetworkId) external view returns (address);
}