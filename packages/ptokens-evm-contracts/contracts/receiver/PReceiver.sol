// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {IPReceiver} from "../interfaces/IPReceiver.sol";

abstract contract PReceiver is IPReceiver {
    /// @inheritdoc IPReceiver
    function receiveUserData(
        bytes4 originNetworkId,
        string calldata originAccount,
        bytes calldata userData
    ) external virtual {}
}
