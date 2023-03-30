// TODO: rename module to get-event-id
const ethers = require('ethers')

const getEventId = (
    originBlockHash,
    originTransactionHash,
    originNetworkId,
    nonce,
    destinationAccount,
    underlyingAssetName,
    underlyingAssetSymbol,
    underlyingAssetDecimals,
    underlyingAssetTokenAddress,
    underlyingAssetNetworkId,
    amount,
    userData,
  ) => {
    const types = [
      'bytes32',
      'bytes32',
      'bytes4',
      'uint256',
      'string',
      'string calldata',
      'string calldata',
      'uint256',
      'address',
      'bytes4',
      'uint256',
      'bytes calldata',
      'bytes32',
    ]

    const values = [
      originBlockHash,
      originTransactionHash,
      originNetworkId,
      nonce,
      destinationAccount,
      underlyingAssetName,
      underlyingAssetSymbol,
      underlyingAssetDecimals,
      underlyingAssetTokenAddress,
      underlyingAssetNetworkId,
      amount,
      userData,
    ]

    const abi = new ethers.utils.AbiCoder()
    return ethers.utils.keccak256(abi.encode(types, values))
  }

module.exports = { getEventId }
