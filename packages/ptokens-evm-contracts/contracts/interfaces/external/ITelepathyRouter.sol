pragma solidity ^0.8.20;

interface ITelepathyRouter {
    function send(
        uint32 destinationChainId,
        address destinationAddress,
        bytes calldata data
    ) external returns (bytes32);
}
