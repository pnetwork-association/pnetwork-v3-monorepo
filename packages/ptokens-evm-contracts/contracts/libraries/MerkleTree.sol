// taken from here: https://github.com/allemanfredi/solidity-merkle-tree/blob/main/contracts/MerkleTree.sol
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

pragma solidity ^0.8.17;

library MerkleTree {
    function getRoot(bytes[] memory data) internal pure returns (bytes32) {
        uint256 n = data.length;

        if (n == 1) {
            return keccak256(data[0]);
        }

        uint256 j = 0;
        uint256 layer = 0;
        uint256 leaves = Math.log2(n) + 1;
        bytes32[][] memory nodes = new bytes32[][](leaves * (2 * n - 1));

        for (uint256 l = 0; l <= leaves; ) {
            nodes[l] = new bytes32[](2 * n - 1);
            unchecked {
                ++l;
            }
        }

        for (uint256 i = 0; i < data.length; ) {
            nodes[layer][j] = keccak256(data[i]);
            unchecked {
                ++j;
                ++i;
            }
        }

        while (n > 1) {
            uint256 layerNodes = 0;
            uint k = 0;

            for (uint256 i = 0; i < n; i += 2) {
                if (i + 1 == n) {
                    if (n % 2 == 1) {
                        nodes[layer + 1][k] = nodes[layer][n - 1];
                        unchecked {
                            ++j;
                            ++layerNodes;
                        }
                        continue;
                    }
                }

                nodes[layer + 1][k] = keccak256(abi.encodePacked(nodes[layer][i], nodes[layer][i + 1]));
                unchecked {
                    ++k;
                    layerNodes += 2;
                }
            }

            n = (n / 2) + (layerNodes % 2 == 0 ? 0 : 1);
            unchecked {
                ++layer;
            }
        }

        return nodes[layer][0];
    }
}
