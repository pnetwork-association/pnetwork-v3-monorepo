// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {IGovernanceMessageHandler} from "../interfaces/IGovernanceMessageHandler.sol";
import {ITelepathyHandler} from "../interfaces/external/ITelepathyHandler.sol";

error NotRouter(address sender, address router);
error UnsupportedChainId(uint32 sourceChainId, uint32 expectedSourceChainId);
error InvalidGovernanceMessageVerifier(address governanceMessagerVerifier, address expectedGovernanceMessageVerifier);

abstract contract GovernanceMessageHandler is IGovernanceMessageHandler, Context {
    address public immutable telepathyRouter;
    address public immutable governanceMessageVerifier;
    uint32 public immutable expectedSourceChainId;

    constructor(address telepathyRouter_, address governanceMessageVerifier_, uint32 expectedSourceChainId_) {
        telepathyRouter = telepathyRouter_;
        governanceMessageVerifier = governanceMessageVerifier_;
        expectedSourceChainId = expectedSourceChainId_;
    }

    function handleTelepathy(uint32 sourceChainId, address sourceSender, bytes memory data) external returns (bytes4) {
        address msgSender = _msgSender();
        if (msgSender != telepathyRouter) revert NotRouter(msgSender, telepathyRouter);
        // NOTE: we just need to check the address that called the telepathy router (GovernanceMessageVerifier)
        // and not who emitted the event on Polygon since it's the GovernanceMessageVerifier that verifies that
        // a certain event has been emitted by the GovernanceMessageEmitter

        if (sourceChainId != expectedSourceChainId) {
            revert UnsupportedChainId(sourceChainId, expectedSourceChainId);
        }

        if (sourceSender != governanceMessageVerifier) {
            revert InvalidGovernanceMessageVerifier(sourceSender, governanceMessageVerifier);
        }

        _onGovernanceMessage(data);

        return ITelepathyHandler.handleTelepathy.selector;
    }

    function _onGovernanceMessage(bytes memory message) internal virtual {}
}
