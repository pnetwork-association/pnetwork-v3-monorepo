// SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.19;

import {PReceiver} from "../receiver/PReceiver.sol";

contract TestReceiver is PReceiver {
    event UserDataReceived(bytes userData);

    function _receiveUserData(bytes memory userData) internal override {
        emit UserDataReceived(userData);
    }
}
