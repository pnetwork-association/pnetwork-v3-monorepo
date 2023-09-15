// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {RLPReader} from "solidity-rlp/contracts/RLPReader.sol";
import {IGovernanceMessageVerifier} from "../interfaces/IGovernanceMessageVerifier.sol";
import {IRootChain} from "../interfaces/external/IRootChain.sol";
import {ITelepathyRouter} from "../interfaces/external/ITelepathyRouter.sol";
import {Merkle} from "../libraries/Merkle.sol";
import {MerklePatriciaProof} from "../libraries/MerklePatriciaProof.sol";

error InvalidGovernanceMessageEmitter(address governanceMessageEmitter, address expecteDgovernanceStateReader);
error InvalidTopic(bytes32 topic, bytes32 expectedTopic);
error InvalidReceiptsRootMerkleProof();
error InvalidRootHashMerkleProof();
error InvalidHeaderBlock();

contract GovernanceMessageVerifier is IGovernanceMessageVerifier {
    address public constant TELEPATHY_ROUTER = 0x41EA857C32c8Cb42EEFa00AF67862eCFf4eB795a;
    address public constant ROOT_CHAIN_ADDRESS = 0x2890bA17EfE978480615e330ecB65333b880928e;
    bytes32 public constant EVENT_SIGNATURE_TOPIC = 0x85aab78efe4e39fd3b313a465f645990e6a1b923f5f5b979957c176e632c5a07; //keccak256(GovernanceMessage(bytes));

    address public governanceMessageEmitter;

    constructor(address governanceMessageEmitter_) {
        governanceMessageEmitter = governanceMessageEmitter_;
    }

    /// @inheritdoc IGovernanceMessageVerifier
    function verifyAndPropagateMessage(
        GovernanceMessageProof calldata proof,
        uint32[] calldata chainIds,
        address[] calldata destinationAddresses
    ) external {
        // NOTE: handle legacy and eip2718
        RLPReader.RLPItem[] memory receiptData = RLPReader.toList(
            RLPReader.toRlpItem(proof.transactionType == 2 ? proof.receipt[1:] : proof.receipt)
        );
        RLPReader.RLPItem[] memory logs = RLPReader.toList(receiptData[3]);
        RLPReader.RLPItem[] memory log = RLPReader.toList(logs[proof.logIndex]);

        // NOTE: only events emitted from the GovernanceMessageEmitter will be propagated
        address proofGovernanceStateReader = RLPReader.toAddress(log[0]);
        if (governanceMessageEmitter != proofGovernanceStateReader) {
            revert InvalidGovernanceMessageEmitter(proofGovernanceStateReader, governanceMessageEmitter);
        }

        RLPReader.RLPItem[] memory topics = RLPReader.toList(log[1]);
        bytes32 proofTopic = bytes32(RLPReader.toBytes(topics[0]));
        if (EVENT_SIGNATURE_TOPIC != proofTopic) {
            revert InvalidTopic(proofTopic, EVENT_SIGNATURE_TOPIC);
        }

        if (
            !MerklePatriciaProof.verify(
                proof.receipt,
                proof.receiptsRootProofPath,
                proof.receiptsRootProofParentNodes,
                proof.receiptsRoot
            )
        ) {
            revert InvalidReceiptsRootMerkleProof();
        }

        bytes32 blockHash = keccak256(
            abi.encodePacked(proof.blockNumber, proof.blockTimestamp, proof.transactionsRoot, proof.receiptsRoot)
        );

        (bytes32 rootHash, , , , ) = IRootChain(ROOT_CHAIN_ADDRESS).headerBlocks(proof.headerBlock);
        if (rootHash == bytes32(0)) {
            revert InvalidHeaderBlock();
        }

        if (!Merkle.checkMembership(blockHash, proof.rootHashProofIndex, rootHash, proof.rootHashProof)) {
            revert InvalidRootHashMerkleProof();
        }

        bytes memory data = RLPReader.toBytes(log[2]);

        // TODO: put chainIds and destinationAddresses within the event
        for (uint256 index = 0; index < chainIds.length; ) {
            ITelepathyRouter(TELEPATHY_ROUTER).send(chainIds[index], destinationAddresses[index], data);

            unchecked {
                ++index;
            }
        }

        emit GovernanceMessagePropagated(data);
    }
}
