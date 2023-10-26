const R = require('ramda')
const { networkIds } = require('../constants')
const constants = require('ptokens-constants')

const getBlockchainTypeFromChainIdSync = _networkId => {
  switch (_networkId) {
    case networkIds.HARDHAT1:
    case networkIds.HARDHAT2:
    case networkIds.BSC_MAINNET:
    case networkIds.GNOSIS_MAINNET:
    case networkIds.POLYGON_MAINNET:
    case networkIds.ARBITRUM_MAINNET:
    case networkIds.ETHEREUM_MAINNET:
    case networkIds.ETHEREUM_GOERLI:
      return constants.blockchainType.EVM
    default:
      return null
  }
}
const getBlockchainTypeFromChainId = _networkId =>
  new Promise((resolve, reject) => {
    const blockchainType = getBlockchainTypeFromChainIdSync(_networkId)

    return R.isNil(blockchainType)
      ? reject(new Error(`Unknown chain ID ${_networkId}`))
      : resolve(blockchainType)
  })

module.exports = {
  getBlockchainTypeFromChainId,
  getBlockchainTypeFromChainIdSync,
}
