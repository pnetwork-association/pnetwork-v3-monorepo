// SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.19;

import {IGovernanceMessageEmitter} from "../interfaces/IGovernanceMessageEmitter.sol";

interface IMockLendingManager {
    function increaseTotalBorrowedAmountByEpoch(uint24 amount, uint16 epoch) external;
}

contract MockRegistrationManager {
    struct Registration {
        address owner;
        uint16 startEpoch;
        uint16 endEpoch;
        bytes1 kind;
    }

    event StakingSentinelSlashed(address indexed sentinel, uint256 amount);

    address public immutable lendingManager;

    address public governanceMessageEmitter;

    constructor(address lendingManager_) {
        lendingManager = lendingManager_;
    }

    mapping(address => Registration) private _sentinelRegistrations;
    mapping(uint16 => uint24) private _sentinelsEpochsTotalStakedAmount;
    mapping(address => mapping(uint16 => uint24)) private _sentinelsEpochsStakedAmount;

    function sentinelRegistration(address sentinel) external view returns (Registration memory) {
        return _sentinelRegistrations[sentinel];
    }

    function sentinelStakedAmountByEpochOf(address sentinel, uint16 epoch) external view returns (uint24) {
        return _sentinelsEpochsStakedAmount[sentinel][epoch];
    }

    function totalSentinelStakedAmountByEpoch(uint16 epoch) external view returns (uint24) {
        return _sentinelsEpochsTotalStakedAmount[epoch];
    }

    function addStakingSentinel(
        address sentinel,
        address owner,
        uint16 startEpoch,
        uint16 endEpoch,
        uint24 amount
    ) external {
        _sentinelRegistrations[sentinel] = Registration({
            owner: owner,
            startEpoch: startEpoch,
            endEpoch: endEpoch,
            kind: 0x01
        });

        for (uint16 epoch = startEpoch; epoch <= endEpoch; epoch++) {
            _sentinelsEpochsTotalStakedAmount[epoch] += amount;
            _sentinelsEpochsStakedAmount[sentinel][epoch] += amount;
        }
    }

    function addBorrowingSentinel(address sentinel, address owner, uint16 startEpoch, uint16 endEpoch) external {
        _sentinelRegistrations[sentinel] = Registration({
            owner: owner,
            startEpoch: startEpoch,
            endEpoch: endEpoch,
            kind: 0x02
        });
        for (uint16 epoch = startEpoch; epoch <= endEpoch; epoch++) {
            IMockLendingManager(lendingManager).increaseTotalBorrowedAmountByEpoch(200000, epoch);
        }
    }

    function setGovernanceMessageEmitter(address governanceMessageEmitter_) external {
        governanceMessageEmitter = governanceMessageEmitter_;
    }

    function slash(address actor, uint256 amount, address challenger) external {
        IGovernanceMessageEmitter(governanceMessageEmitter).slashActor(actor);
        emit StakingSentinelSlashed(actor, amount);
    }
}
