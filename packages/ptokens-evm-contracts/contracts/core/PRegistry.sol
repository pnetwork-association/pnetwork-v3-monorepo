pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import {IPRegistry} from "../interfaces/IPRegistry.sol";

contract PRegistry is IPRegistry, AccessControl {
  bytes32 public constant ADD_SUPPORTED_NETWORK_ID_ROLE = keccak256("ADD_SUPPORTED_NETWORK_ID_ROLE");

  address[] private _supportedHubs;
  uint32[] private _supportedChainIds;
  bytes4[] private _supportedNetworkIds;
  mapping(bytes4 => address) _networkIdToHub;
  mapping(uint32 => bytes4) _chainIdToNetworkId;

  constructor(address dandelionVoting) {
    _setupRole(ADD_SUPPORTED_NETWORK_ID_ROLE, dandelionVoting);
  }

  // @inheritdoc IPRegistry
  function addProtocolBlockchain(uint32 chainId, bytes4 networkId, address hub) external onlyRole(ADD_SUPPORTED_NETWORK_ID_ROLE) {
    _supportedHubs.push(hub);
    _supportedChainIds.push(chainId);
    _supportedNetworkIds.push(networkId);

    _networkIdToHub[networkId] = hub;
    _chainIdToNetworkId[chainId] = networkId;
  }

  // @inheritdoc IPRegistry
  function isNetworkIdSupported(bytes4 networkId) external view returns (bool) {
    address hub = _networkIdToHub[networkId];

    return (hub != address(0));
  }

  // @inheritdoc IPRegistry
  function isChainIdSupported(uint32 chainId) external view returns (bool) {
    bytes4 networkId = _chainIdToNetworkId[chainId];

    return (networkId != bytes4(0));
  }

  // @inheritdoc IPRegistry
  function getHubByNetworkId(bytes4 networkId) external view returns (address) {
    return _networkIdToHub[networkId];
  }

  // @inheritdoc IPRegistry
  function getSupportedHubs() external view returns (address[] memory) {
    return _supportedHubs;
  }

  // @inheritdoc IPRegistry
  function getSupportedChainIds() external view returns (uint32[] memory) {
    return _supportedChainIds;
  }

  // @inheritdoc IPRegistry
  function getSupportedNetworkIds() external view returns (bytes4[] memory) {
    return _supportedNetworkIds;
  }
}