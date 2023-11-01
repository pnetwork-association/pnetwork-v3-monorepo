const ethers = require('ethers')
const { evm } = require('ptokens-constants')
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
  userDataProtocolFeeAssetAmount,
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
        uint256 userDataProtocolFeeAssetAmount;
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
        return sha256(abi.encode(operation));
    }
  */

  const types = [evm.events.OPERATION_TUPLE]
  const coder = new ethers.AbiCoder()
  return ethers.sha256(
    coder.encode(types, [
      [
        originatingBlockHash || blockHash,
        originatingTransactionHash || transactionHash,
        optionsMask,
        nonce,
        underlyingAssetDecimals,
        assetAmount,
        userDataProtocolFeeAssetAmount,
        networkFeeAssetAmount,
        forwardNetworkFeeAssetAmount,
        underlyingAssetTokenAddress,
        originatingNetworkId || networkId,
        destinationNetworkId,
        forwardDestinationNetworkId,
        underlyingAssetNetworkId,
        originatingAddress,
        destinationAccount,
        underlyingAssetName,
        underlyingAssetSymbol,
        userData,
        isForProtocol,
      ],
    ])
  )
}

const fallbackEventId = (networkId, blockHash, transactionHash, nonce) =>
  ethers.keccak256(ethers.concat([networkId, blockHash, transactionHash, ethers.toBeHex(nonce)]))

const getEventId = ({
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
  userDataProtocolFeeAssetAmount,
  networkFeeAssetAmount,
  forwardNetworkFeeAssetAmount,
  userData,
  optionsMask,
  isForProtocol,
}) =>
  getBlockchainTypeFromChainId(destinationNetworkId)
    .then(_type => {
      switch (_type) {
        case blockchainType.EVM:
          return getEventIdEvm({
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
            userDataProtocolFeeAssetAmount,
            networkFeeAssetAmount,
            forwardNetworkFeeAssetAmount,
            userData,
            optionsMask,
            isForProtocol,
          })
        default:
          // there might be multiple events in the same transaction,
          // thus factor in a nonce, i.e. a nonce argument if present in the log args,
          // or the log number otherwise
          return fallbackEventId(networkId, blockHash, transactionHash, nonce)
      }
    })
    // This should handle cases where
    //  - The ID is not defined in the networkIds object
    //  - The event does not have the expected properties
    .catch(
      _err => logger.error(_err) || fallbackEventId(networkId, blockHash, transactionHash, nonce)
    )

module.exports = { getEventId }
