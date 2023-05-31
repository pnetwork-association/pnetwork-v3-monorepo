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
    function setGovernanceMessageVerifier(address governanceMessageVerifier_) external;

    function setSourceChainId(uint32 sourceChainId_) external;
}
