// TODO: rename module to get-event-id
const ethers = require('ethers')
const { blockchainType } = require('../constants')
const { getBlockchainTypeFromChainId } = require('./utils-chain-id')

const getEventIdEvm = (
  originBlockHash,
  originTransactionHash,
  originNetworkId,
  nonce,
  destinationAccount,
  destinationNetworkId,
  underlyingAssetName,
  underlyingAssetSymbol,
  underlyingAssetDecimals,
  underlyingAssetTokenAddress,
  underlyingAssetNetworkId,
  amount,
  userData,
  optionsMask
) => {
  const abi = [
    'function protocolExecuteOperation(\
        bytes32 originBlockHash,\
        bytes32 originTransactionHash,\
        bytes4 originNetworkId,\
        uint256 nonce,\
        address destinationAccount,\
        bytes4 destinationNetworkId,\
        string calldata underlyingAssetName,\
        string calldata underlyingAssetSymbol,\
        uint256 underlyingAssetDecimals,\
        address underlyingAssetTokenAddress,\
        bytes4 underlyingAssetNetworkId,\
        uint256 amount,\
        bytes calldata userData,\
        bytes32 optionsMask\
    )',
  ]
  const values = [
    originBlockHash,
    originTransactionHash,
    originNetworkId,
    nonce || 0,
    destinationAccount || '',
    destinationNetworkId || '0x00',
    underlyingAssetName || '',
    underlyingAssetSymbol || '',
    underlyingAssetDecimals || 0,
    underlyingAssetTokenAddress || '0x00',
    underlyingAssetNetworkId || '0x00000000',
    amount || '0',
    userData || '0x',
    optionsMask || '0x00',
  ]
  const iface = new ethers.utils.Interface(abi)
  return ethers.utils.keccak256(
    iface.encodeFunctionData('protocolExecuteOperation', values)
  )
}

const fallbackEventId = (
  originNetworkId,
  originBlockHash,
  originTransactionHash
) =>
  ethers.keccak256(
    ethers.concat([originNetworkId, originBlockHash, originTransactionHash])
  )

const getEventId = (
  originBlockHash,
  originTransactionHash,
  originNetworkId,
  nonce,
  destinationAccount,
  destinationNetworkId,
  underlyingAssetName,
  underlyingAssetSymbol,
  underlyingAssetDecimals,
  underlyingAssetTokenAddress,
  underlyingAssetNetworkId,
  amount,
  userData,
  optionsMask
) =>
  getBlockchainTypeFromChainId(destinationNetworkId)
    .then(_type => {
      switch (_type) {
        case blockchainType.EVM:
          return getEventIdEvm(
            originBlockHash,
            originTransactionHash,
            originNetworkId,
            nonce,
            destinationAccount,
            destinationNetworkId,
            underlyingAssetName,
            underlyingAssetSymbol,
            underlyingAssetDecimals,
            underlyingAssetTokenAddress,
            underlyingAssetNetworkId,
            amount,
            userData,
            optionsMask
          )
        default:
          return fallbackEventId(
            originNetworkId,
            originBlockHash,
            originTransactionHash
          )
      }
    })
    .catch(_ =>
      fallbackEventId(originNetworkId, originBlockHash, originTransactionHash)
    )

module.exports = { getEventId }
