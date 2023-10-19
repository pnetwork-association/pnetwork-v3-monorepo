// SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.20;

import {Utils} from "../libraries/Utils.sol";
import {IEpochsManager} from "@pnetwork-association/dao-v2-contracts/contracts/interfaces/IEpochsManager.sol";
import {IPRegistry} from "../interfaces/IPRegistry.sol";
import {ISlasher} from "../interfaces/ISlasher.sol";
import {IRegistrationManager} from "@pnetwork-association/dao-v2-contracts/contracts/interfaces/IRegistrationManager.sol";

error NotHub(address hub);
error NotSupportedNetworkId(bytes4 originNetworkId);
error InvalidEpoch(uint16 epoch, uint16 expectedEpoch);

contract Slasher is ISlasher {
    address public immutable pRegistry;
    address public immutable epochsManager;
    address public immutable registrationManager;
    uint256 public immutable stakingSentinelAmountToSlash;

    constructor(
        address epochsManager_,
        address pRegistry_,
        address registrationManager_,
        uint256 stakingSentinelAmountToSlash_
    ) {
        epochsManager = epochsManager_;
        pRegistry = pRegistry_;
        stakingSentinelAmountToSlash = stakingSentinelAmountToSlash_;
        registrationManager = registrationManager_;
    }

    function receiveUserData(
        bytes4 originNetworkId,
        string calldata originAccount,
        bytes calldata userData
    ) external override {
        uint16 currentEpoch = IEpochsManager(epochsManager).currentEpoch();
        address originAccountAddress = Utils.hexStringToAddress(originAccount);

        if (!IPRegistry(pRegistry).isNetworkIdSupported(originNetworkId)) revert NotSupportedNetworkId(originNetworkId);

        address registeredHub = IPRegistry(pRegistry).getHubByNetworkId(originNetworkId);
        if (originAccountAddress != registeredHub) revert NotHub(originAccountAddress);

        (uint16 epoch, address actor, address challenger) = abi.decode(userData, (uint16, address, address));

        if (epoch != currentEpoch) revert InvalidEpoch(epoch, currentEpoch);

        IRegistrationManager.Registration memory registration = IRegistrationManager(registrationManager)
            .sentinelRegistration(actor);

        // See file `Constants.sol` in dao-v2-contracts:
        //
        // bytes1 public constant REGISTRATION_SENTINEL_STAKING = 0x01;
        //
        // Borrowing sentinels have nothing at stake, so the slashing
        // quantity will be zero
        uint256 amountToSlash = registration.kind == 0x01 ? stakingSentinelAmountToSlash : 0;
        IRegistrationManager(registrationManager).slash(actor, amountToSlash, challenger);
    }
}
