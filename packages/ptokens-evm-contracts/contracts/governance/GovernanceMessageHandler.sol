// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IGovernanceMessageHandler} from "../interfaces/IGovernanceMessageHandler.sol";
import {ITelepathyHandler} from "../interfaces/external/ITelepathyHandler.sol";
import {Errors} from "../libraries/Errors.sol";

abstract contract GovernanceMessageHandler is IGovernanceMessageHandler, Ownable {
    address public constant TELEPATHY_ROUTER = 0x41EA857C32c8Cb42EEFa00AF67862eCFf4eB795a;

    address public governanceMessageVerifier;
    uint32 public sourceChainId;

    function setGovernanceMessageVerifier(address governanceMessageVerifier_) external onlyOwner {
        governanceMessageVerifier = governanceMessageVerifier_;
    }

    function setSourceChainId(uint32 sourceChainId_) external onlyOwner {
        sourceChainId = sourceChainId_;
    }

    function handleTelepathy(
        uint32 sourceChainId_,
        address senderAddress,
        bytes memory data
    ) external returns (bytes4) {
        if (msg.sender != TELEPATHY_ROUTER) revert Errors.NotRouter(msg.sender, TELEPATHY_ROUTER);
        if (sourceChainId != sourceChainId_) revert Errors.InvalidSourceChainId(sourceChainId_, sourceChainId);
        if (senderAddress != governanceMessageVerifier)
            revert Errors.NotGovernanceMessageVerifier(senderAddress, governanceMessageVerifier);

        _onMessage(data);

        return ITelepathyHandler.handleTelepathy.selector;
    }

    function _onMessage(bytes memory data) internal virtual {}
}
