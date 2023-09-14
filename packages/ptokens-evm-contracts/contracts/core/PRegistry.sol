pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import {IPRegistry} from "../interfaces/IPRegistry.sol";

contract PRegistry is IPRegistry, AccessControl {
  bytes32 public constant ADD_SUPPORTED_NETWORK_ID_ROLE = keccak256("ADD_SUPPORTED_NETWORK_ID_ROLE");

  mapping(bytes4 => address) private _networkIdToHub;

  constructor(address dandelionVoting) {
    _setupRole(ADD_SUPPORTED_NETWORK_ID_ROLE, dandelionVoting);
  }

  function isNetworkIdSupported(bytes4 networkId) external view returns (bool) {
    address hub = _networkIdToHub[networkId];

    return (hub != address(0));
  }

  function addSupportedNetworkId(bytes4 networkId, address hub) public onlyRole(ADD_SUPPORTED_NETWORK_ID_ROLE) {
    _networkIdToHub[networkId] = hub;
  }

  function hubByNetworkId(bytes4 sourceNetworkId) external view returns (address) {
    return _networkIdToHub[sourceNetworkId];
  }
}