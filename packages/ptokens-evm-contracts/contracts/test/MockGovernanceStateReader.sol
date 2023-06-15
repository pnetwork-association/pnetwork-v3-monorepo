// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {IGovernanceStateReader} from "../interfaces/IGovernanceStateReader.sol";
import {MerkleTree} from "../libraries/MerkleTree.sol";
import {Constants} from "../libraries/Constants.sol";

contract MockGovernanceStateReader is IGovernanceStateReader {
    function propagateSentinels(address[] calldata sentinels) external {
        address[] memory sentinels = new address[](15);
        sentinels[0] = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        sentinels[1] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        sentinels[2] = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
        sentinels[3] = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;
        sentinels[4] = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65;
        sentinels[5] = 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc;
        sentinels[6] = 0x976EA74026E726554dB657fA54763abd0C3a0aa9;
        sentinels[7] = 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955;
        sentinels[8] = 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f;
        sentinels[9] = 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720;
        sentinels[10] = 0xBcd4042DE499D14e55001CcbB24a551F3b954096;
        sentinels[11] = 0x71bE63f3384f5fb98995898A86B02Fb2426c5788;
        sentinels[12] = 0xFABB0ac9d68B0B445fB7357272Ff202C5651694a;
        sentinels[13] = 0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec;
        sentinels[14] = 0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097;

        bytes[] memory data = new bytes[](sentinels.length);

        for (uint256 i = 0; i < sentinels.length; i++) {
            data[i] = abi.encodePacked(sentinels[i]);
        }

        bytes memory message = bytes(
            abi.encode(Constants.GOVERNANCE_MESSAGE_SENTINELS, abi.encode(1, MerkleTree.getRoot(data)))
        );
        emit GovernanceMessage(message);
    }

    function propagateGuardians(address[] calldata guardians) external {}
}
