// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import {IEpochsManager} from "@pnetwork/dao-v2-contracts/contracts/interfaces/IEpochsManager.sol";
import {Roles} from "../libraries/Roles.sol";

contract EpochsManager is IEpochsManager {
    uint256 private _epochDuration;
    uint256 private _startFirstEpochTimestamp;

    constructor(uint256 epochDuration_) {
        _epochDuration = epochDuration_;
        _startFirstEpochTimestamp = block.timestamp;
    }

    /// @inheritdoc IEpochsManager
    function currentEpoch() external view returns (uint16) {
        return uint16((block.timestamp - _startFirstEpochTimestamp) / _epochDuration);
    }

    /// @inheritdoc IEpochsManager
    function epochDuration() external view returns (uint256) {
        return _epochDuration;
    }

    /// @inheritdoc IEpochsManager
    function startFirstEpochTimestamp() external view returns (uint256) {
        return _startFirstEpochTimestamp;
    }

}