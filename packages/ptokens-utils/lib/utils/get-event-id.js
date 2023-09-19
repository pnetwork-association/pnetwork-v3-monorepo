const ethers = require('ethers')
const { logger } = require('../logger')
const { blockchainType } = require('../constants')
const { getBlockchainTypeFromChainId } = require('./utils-network-id')

const getEventIdEvm = ({
  originatingBlockHash,
  originatingTransactionHash,
  originatingNetworkId,
  originatingAddress,
  blockHash,
  transactionHash,
  networkId,
  nonce,
  destinationAccount,
  destinationNetworkId,
  forwardDestinationNetworkId,
  underlyingAssetName,
  underlyingAssetSymbol,
  underlyingAssetDecimals,
  underlyingAssetTokenAddress,
  underlyingAssetNetworkId,
  assetAmount,
  protocolFeeAssetAmount,
  networkFeeAssetAmount,
  forwardNetworkFeeAssetAmount,
  userData,
  optionsMask,
  isForProtocol,
}) => {
  /*
    struct Operation {
        bytes32 originBlockHash;
        bytes32 originTransactionHash;
        bytes32 optionsMask;
        uint256 nonce;
        uint256 underlyingAssetDecimals;
        uint256 assetAmount;
        uint256 protocolFeeAssetAmount;
        uint256 networkFeeAssetAmount;
        uint256 forwardNetworkFeeAssetAmount;
        address underlyingAssetTokenAddress;
        bytes4 originNetworkId;
        bytes4 destinationNetworkId;
        bytes4 forwardDestinationNetworkId;
        bytes4 underlyingAssetNetworkId;
        string originAccount;
        string destinationAccount;
        string underlyingAssetName;
        string underlyingAssetSymbol;
        bytes userData;
        bool isForProtocol;
    }
    function operationIdOf(Operation calldata operation) public pure returns (bytes32) {
    return
      sha256(
        abi.encode(
            operation.originBlockHash,
            operation.originTransactionHash,
            operation.originNetworkId,
            operation.nonce,
            operation.originAccount,
            operation.destinationAccount,
            operation.destinationNetworkId,
            operation.forwardDestinationNetworkId,
            operation.underlyingAssetName,
            operation.underlyingAssetSymbol,
            operation.underlyingAssetDecimals,
            operation.underlyingAssetTokenAddress,
            operation.underlyingAssetNetworkId,
            operation.assetAmount,
            operation.protocolFeeAssetAmount,
            operation.networkFeeAssetAmount,
            operation.forwardNetworkFeeAssetAmount,
            operation.userData,
            operation.optionsMask,
            operation.isForProtocol
        )
      );
    }
  */

  const types = [
    'bytes32', // operation.originBlockHash,
    'bytes32', // operation.originTransactionHash,
    'bytes4', // operation.originNetworkId,
    'uint256', // operation.nonce,
    'string', // operation.originAccount,
    'string', // operation.destinationAccount,
    'bytes4', // operation.destinationNetworkId,
    'bytes4', // operation.forwardDestinationNetworkId,
    'string', // operation.underlyingAssetName,
    'string', // operation.underlyingAssetSymbol,
    'uint256', // operation.underlyingAssetDecimals,
    'address', // operation.underlyingAssetTokenAddress,
    'bytes4', // operation.underlyingAssetNetworkId,
    'uint256', // operation.assetAmount,
    'uint256', // operation.protocolFeeAssetAmount,
    'uint256', // operation.networkFeeAssetAmount,
    'uint256', // operation.forwardNetworkFeeAssetAmount,
    'bytes', // operation.userData,
    'bytes32', // operation.optionsMask,
    'bool', // operation.isForProtocol
  ]
  const coder = new ethers.AbiCoder()
  return ethers.sha256(
    coder.encode(types, [
      originatingBlockHash || blockHash,
      originatingTransactionHash || transactionHash,
      originatingNetworkId || networkId,
      nonce,
      originatingAddress,
      destinationAccount,
      destinationNetworkId,
      forwardDestinationNetworkId,
      underlyingAssetName,
      underlyingAssetSymbol,
      underlyingAssetDecimals,
      underlyingAssetTokenAddress,
      underlyingAssetNetworkId,
      assetAmount,
      protocolFeeAssetAmount,
      networkFeeAssetAmount,
      forwardNetworkFeeAssetAmount,
      userData,
      optionsMask,
      isForProtocol,
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
  forwardDestinationNetworkId,
  underlyingAssetName,
  underlyingAssetSymbol,
  underlyingAssetDecimals,
  underlyingAssetTokenAddress,
  underlyingAssetNetworkId,
  assetAmount,
  protocolFeeAssetAmount,
  networkFeeAssetAmount,
  forwardNetworkFeeAssetAmount,
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
            forwardDestinationNetworkId,
            underlyingAssetName,
            underlyingAssetSymbol,
            underlyingAssetDecimals,
            underlyingAssetTokenAddress,
            underlyingAssetNetworkId,
            assetAmount,
            protocolFeeAssetAmount,
            networkFeeAssetAmount,
            forwardNetworkFeeAssetAmount,
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
