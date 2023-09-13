pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import {IPRegistry} from "../interfaces/IPRegistry.sol";

contract PRegistry is IPRegistry, AccessControl {
  bytes32 public constant DAO_ROLE = keccak256("DAO");

  mapping(bytes4 => address) private networkIdToHub_;

  constructor(address dao) {
    _setupRole(DAO_ROLE, dao);
  }

  function isNetworkIdSupported(bytes4 networkId) external view returns (bool) {
    address hub = networkIdToHub_[networkId];

    return (hub != address(0));
  }

  function addSupportedNetworkId(bytes4 networkId, address hub) public onlyRole(DAO_ROLE) {
    networkIdToHub_[networkId] = hub;
  }

  function hubByNetworkId(bytes4 sourceNetworkId) external view returns (address) {
    return networkIdToHub_[sourceNetworkId];
  }
}