// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {PReceiver} from "../receiver/PReceiver.sol";
import {IPRegistry} from "../interfaces/IPRegistry.sol";
import {IRegistrationManager} from "../interfaces/IRegistrationManager.sol";


contract Slasher is PReceiver {
    error NotHub();

    address _pRegistry;
    address _registrationManager;
    constructor(address pRegistry, address registrationManager) {
        _pRegistry = pRegistry;
        _registrationManager = registrationManager;
    }

    function receiveUserData(bytes4 sourceNetworkId, address originAccount, bytes calldata userData) external {
        if (originAccount != IPRegistry(_pRegistry).hubByNetworkId(sourceNetworkId))
            revert NotHub();

        // TODO: decode proof and amount from userdata
        uint256 amount = 1000;
        bytes32[] memory proof;

        (address actor, address challenger) = abi.decode(userData, (address, address));

        IRegistrationManager(_registrationManager).slash(actor, proof, amount, challenger);
    }
}