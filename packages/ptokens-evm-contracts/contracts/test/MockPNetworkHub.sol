// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {PNetworkHub} from "../core/PNetworkHub.sol";

contract MockPNetworkHub is PNetworkHub {
    constructor(
        address factory_,
        uint32 baseChallengePeriodDuration_,
        address epochsManager_,
        address telepathyRouter,
        address governanceMessageVerifier,
        uint32 allowedSourceChainId,
        uint256 lockedAmountChallengePeriod_,
        uint16 kChallengePeriod_,
        uint16 maxOperationsInQueue_,
        bytes4 interimChainNetworkId_,
        uint256 lockedAmountOpenChallenge_,
        uint64 maxChallengeDuration_
    )
        PNetworkHub(
            factory_,
            baseChallengePeriodDuration_,
            epochsManager_,
            telepathyRouter,
            governanceMessageVerifier,
            allowedSourceChainId,
            lockedAmountChallengePeriod_,
            kChallengePeriod_,
            maxOperationsInQueue_,
            interimChainNetworkId_,
            lockedAmountOpenChallenge_,
            maxChallengeDuration_
        )
    {}

    function receiveFakeGovernanceMessage(bytes memory message) external {
        _onGovernanceMessage(message);
    }
}
