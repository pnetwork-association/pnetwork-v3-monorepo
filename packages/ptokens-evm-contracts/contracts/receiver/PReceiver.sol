// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import {IPReceiver} from "../interfaces/IPReceiver.sol";

abstract contract PReceiver is IPReceiver {
    /// @inheritdoc IPReceiver
    function receiveUserData(bytes calldata userData) public virtual {
        // TODO: Do we need the check who call receiveUserData? only the StateManager should call it
        _receiveUserData(userData);
    }

    function _receiveUserData(bytes memory userData) internal virtual;
}
