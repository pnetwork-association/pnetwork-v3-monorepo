// SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.19;

import {Utils} from "../libraries/Utils.sol";
import {PReceiver} from "../receiver/PReceiver.sol";
import {IPRegistry} from "../interfaces/IPRegistry.sol";
import {IRegistrationManager} from "@pnetwork-association/dao-v2-contracts/contracts/interfaces/IRegistrationManager.sol";

error NotHub(address hub);
error NotSupportedNetworkId(bytes4 originNetworkId);

contract Slasher is PReceiver {
    address public immutable pRegistry;
    address public immutable registrationManager;

    // Quantity of PNT to slash
    uint256 public immutable slashingQuantity;

    // TODO: this could be a good metric on how
    // to change the slashing quantity value.
    // uint256 public immutable slashingFrequency

    constructor(address pRegistry_, address registrationManager_, uint256 slashingQuantity_) {
        pRegistry = pRegistry_;
        slashingQuantity = slashingQuantity_;
        registrationManager =  registrationManager_;
    }

    function receiveUserData(
        bytes4 originNetworkId,
        string calldata originAccount,
        bytes calldata userData
    ) external override {
        address originAccountAddress = Utils.hexStringToAddress(originAccount);

        if (!IPRegistry(pRegistry).isNetworkIdSupported(originNetworkId))
            revert NotSupportedNetworkId(originNetworkId);

        address registeredHub = IPRegistry(pRegistry).hubByNetworkId(originNetworkId);

        if (originAccountAddress != registeredHub)
            revert NotHub(originAccountAddress);

        (address actor, address challenger) = abi.decode(userData, (address, address));

        IRegistrationManager.Registration memory registration = IRegistrationManager(registrationManager).sentinelRegistration(actor);

        // See file `Constants.sol` in dao-v2-contracts:
        //
        // bytes1 public constant REGISTRATION_SENTINEL_STAKING = 0x01;
        //
        // Borrowing sentinels have nothing at stake, so the slashing
        // quantity will be zero
        uint256 amountToSlash = 0;
        if (registration.kind == 0x01) {
            amountToSlash = slashingQuantity * 10 ** 18;
        }

        IRegistrationManager(registrationManager).slash(actor, amountToSlash, challenger);
    }
}
