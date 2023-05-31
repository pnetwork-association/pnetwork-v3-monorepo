// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IGovernanceMessageHandler} from "../interfaces/IGovernanceMessageHandler.sol";
import {ITelepathyHandler} from "../interfaces/external/ITelepathyHandler.sol";
import {Errors} from "../libraries/Errors.sol";

abstract contract GovernanceMessageHandler is IGovernanceMessageHandler, Ownable {
    address public constant TELEPATHY_ROUTER = 0x41EA857C32c8Cb42EEFa00AF67862eCFf4eB795a;

    mapping(uint32 => mapping(address => bool)) private _sourceChainGovernanceMessagesVerifiersEnabled;

    function enableGovernanceMessageVerifierForSourceChain(
        address governanceMessageVerifier,
        uint32 sourceChainId
    ) external onlyOwner /*onlyGovernance*/ {
        _sourceChainGovernanceMessagesVerifiersEnabled[sourceChainId][governanceMessageVerifier] = true;
    }

    function disableGovernanceMessageVerifierForSourceChain(
        address governanceMessageVerifier,
        uint32 sourceChainId
    ) external onlyOwner /*onlyGovernance*/ {
        _sourceChainGovernanceMessagesVerifiersEnabled[sourceChainId][governanceMessageVerifier] = false;
    }

    function handleTelepathy(uint32 sourceChainId, address senderAddress, bytes memory data) external returns (bytes4) {
        address sender = _msgSender();
        if (sender != TELEPATHY_ROUTER) revert Errors.NotRouter(sender, TELEPATHY_ROUTER);
        // NOTE: we just need to check the address that called the telepathy router (GovernanceMessageVerifier)
        // and not who emitted the event on Polygon since it's the GovernanceMessageVerifier that verifies that
        // a certain event has been emitted by the GovernanceStateReader
        if (!_sourceChainGovernanceMessagesVerifiersEnabled[sourceChainId][senderAddress]) {
            revert Errors.InvalidGovernanceMessageVerifier(senderAddress);
        }

        _onGovernanceMessage(data);

        return ITelepathyHandler.handleTelepathy.selector;
    }

    function _onGovernanceMessage(bytes memory message) internal virtual {}
}
