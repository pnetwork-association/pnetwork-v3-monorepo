const R = require('ramda')
const constants = require('ptokens-constants')

const getBlockchainTypeFromChainIdSync = _networkId => {
  switch (_networkId) {
    case constants.networkIds.HARDHAT1:
    case constants.networkIds.HARDHAT2:
    case constants.networkIds.BSC_MAINNET:
    case constants.networkIds.GNOSIS_MAINNET:
    case constants.networkIds.POLYGON_MAINNET:
    case constants.networkIds.ARBITRUM_MAINNET:
    case constants.networkIds.ETHEREUM_MAINNET:
    case constants.networkIds.ETHEREUM_GOERLI:
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
