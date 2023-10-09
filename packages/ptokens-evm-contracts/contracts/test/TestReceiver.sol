// SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.20;

import {PReceiver} from "../receiver/PReceiver.sol";

contract TestReceiver is PReceiver {
    event UserDataReceived(bytes4 originNetworkId, string originAccount, bytes userData);

    function receiveUserData(
        bytes4 originNetworkId,
        string calldata originAccount,
        bytes calldata userData
    ) external override {
        emit UserDataReceived(originNetworkId, originAccount, userData);
    }
}
