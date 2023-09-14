// SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.19;

import {Utils} from "../libraries/Utils.sol";
import {PReceiver} from "../receiver/PReceiver.sol";
import {IPRegistry} from "../interfaces/IPRegistry.sol";
import {IRegistrationManager} from "@pnetwork-association/dao-v2-contracts/contracts/interfaces/IRegistrationManager.sol";

error NotHub(address hub);
error NotSupportedNetworkId(bytes4 originNetworkId);

contract Slasher is PReceiver {
    address pRegistry_;
    address registrationManager_;

    constructor(address pRegistry, address registrationManager) {
        pRegistry_ = pRegistry;
        registrationManager_ =  registrationManager;
    }

    function receiveUserData(
        bytes4 originNetworkId,
        string calldata originAccount,
        bytes calldata userData
    ) external override {
        address originAccountAddress = Utils.hexStringToAddress(originAccount);

        if (!IPRegistry(pRegistry_).isNetworkIdSupported(originNetworkId))
            revert NotSupportedNetworkId(originNetworkId);

        address registeredHub = IPRegistry(pRegistry_).hubByNetworkId(originNetworkId);

        if (originAccountAddress != registeredHub)
            revert NotHub(originAccountAddress);

        uint256 amount = 1000;

        (address actor, address challenger) = abi.decode(userData, (address, address));
        IRegistrationManager(registrationManager_).slash(actor, amount, challenger);
    }
}
