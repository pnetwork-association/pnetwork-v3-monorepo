// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import {ITelepathyHandler} from "../interfaces/external/ITelepathyHandler.sol";

/**
 * @title IGovernanceMessageHandler
 * @author pNetwork
 *
 * @notice
 */

interface IGovernanceMessageHandler is ITelepathyHandler {
    function enableGovernanceMessageVerifierForSourceChain(
        address governanceMessageVerifier,
        uint32 sourceChainId
    ) external;

    function disableGovernanceMessageVerifierForSourceChain(
        address governanceMessageVerifier,
        uint32 sourceChainId
    ) external;
}
