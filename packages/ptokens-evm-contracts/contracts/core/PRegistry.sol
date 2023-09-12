pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import {IPRegistry} from "../interfaces/IPRegistry.sol";

contract PRegistry is IPRegistry, AccessControl {
  bytes32 public constant DAO_ROLE = keccak256("DAO");

  mapping(bytes4 => address) private _networkIdToHub;

  constructor(address dao) {
    _setupRole(DAO_ROLE, dao);
  }

  function isNetworkIdSupported(bytes4 networkId) public view returns (bool) {
    address hub = _networkIdToHub[networkId];

    if (hub != address(0)) {
      return true;
    }
    return false;
  }

  function addSupportedNetworkId(bytes4 networkId, address hub) public onlyRole(DAO_ROLE) {
    _networkIdToHub[networkId] = hub;
  }

  function hubByNetworkId(bytes4 sourceNetworkId) external view returns (address) {
    return _networkIdToHub[sourceNetworkId];
  }
}