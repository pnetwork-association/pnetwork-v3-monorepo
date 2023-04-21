const ethers = require('ethers')
const { logger } = require('../logger')
const { blockchainType } = require('../constants')
const { getBlockchainTypeFromChainId } = require('./utils-network-id')

const getEventIdEvm = ({
  originatingBlockHash,
  originatingTransactionHash,
  originatingNetworkId,
  blockHash,
  transactionHash,
  networkId,
  nonce,
  destinationAccount,
  destinationNetworkId,
  underlyingAssetName,
  underlyingAssetSymbol,
  underlyingAssetDecimals,
  underlyingAssetTokenAddress,
  underlyingAssetNetworkId,
  assetAmount,
  userData,
  optionsMask,
}) => {
  /*
    struct Operation {
        bytes32 originBlockHash;
        bytes32 originTransactionHash;
        bytes32 optionsMask;
        uint256 nonce;
        uint256 underlyingAssetDecimals;
        uint256 amount;
        address underlyingAssetTokenAddress;
        bytes4 originNetworkId;
        bytes4 destinationNetworkId;
        bytes4 underlyingAssetNetworkId;
        string destinationAccount;
        string underlyingAssetName;
        string underlyingAssetSymbol;
        bytes userData;
    }
    function operationIdOf(Operation memory operation) public pure returns (bytes32) {
    return
        keccak256(
            abi.encode(
                operation.originBlockHash,
                operation.originTransactionHash,
                operation.originNetworkId,
                operation.nonce,
                operation.destinationAccount,
                operation.destinationNetworkId,
                operation.underlyingAssetName,
                operation.underlyingAssetSymbol,
                operation.underlyingAssetDecimals,
                operation.underlyingAssetTokenAddress,
                operation.underlyingAssetNetworkId,
                operation.amount,
                operation.userData,
                operation.optionsMask
            )
        );
    }
  */

  const types = [
    'bytes32',
    'bytes32',
    'bytes4',
    'uint256',
    'string',
    'bytes4',
    'string',
    'string',
    'uint256',
    'address',
    'bytes4',
    'uint256',
    'bytes',
    'bytes32',
  ]
  const coder = new ethers.AbiCoder()
  return ethers.keccak256(
    coder.encode(types, [
      originatingBlockHash || blockHash,
      originatingTransactionHash || transactionHash,
      originatingNetworkId || networkId,
      nonce,
      destinationAccount,
      destinationNetworkId,
      underlyingAssetName,
      underlyingAssetSymbol,
      underlyingAssetDecimals,
      underlyingAssetTokenAddress,
      underlyingAssetNetworkId,
      assetAmount,
      userData,
      optionsMask,
    ])
  )
}

const fallbackEventId = (networkId, blockHash, transactionHash) =>
  ethers.keccak256(ethers.concat([networkId, blockHash, transactionHash]))

const getEventId = ({
  originatingBlockHash,
  originatingTransactionHash,
  originatingNetworkId,
  blockHash,
  transactionHash,
  networkId,
  nonce,
  destinationAccount,
  destinationNetworkId,
  underlyingAssetName,
  underlyingAssetSymbol,
  underlyingAssetDecimals,
  underlyingAssetTokenAddress,
  underlyingAssetNetworkId,
  assetAmount,
  userData,
  optionsMask,
}) =>
  getBlockchainTypeFromChainId(destinationNetworkId)
    .then(_type => {
      switch (_type) {
        case blockchainType.EVM:
          return getEventIdEvm({
            originatingBlockHash,
            originatingTransactionHash,
            originatingNetworkId,
            blockHash,
            transactionHash,
            networkId,
            nonce,
            destinationAccount,
            destinationNetworkId,
            underlyingAssetName,
            underlyingAssetSymbol,
            underlyingAssetDecimals,
            underlyingAssetTokenAddress,
            underlyingAssetNetworkId,
            assetAmount,
            userData,
            optionsMask,
          })
        default:
          return fallbackEventId(networkId, blockHash, transactionHash)
      }
    })
    // This should handle cases where
    //  - The ID is not defined in the networkIds object
    //  - The event does not have the expected properties
    .catch(_err => logger.error(_err) || fallbackEventId(networkId, blockHash, transactionHash))

module.exports = { getEventId }
