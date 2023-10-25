const { networkIds } = require('../constants')
const constants = require('ptokens-constants')

const getBlockchainTypeFromChainId = _networkId =>
  new Promise((resolve, reject) => {
    switch (_networkId) {
      case networkIds.HARDHAT1:
      case networkIds.HARDHAT2:
      case networkIds.BSC_MAINNET:
      case networkIds.GNOSIS_MAINNET:
      case networkIds.POLYGON_MAINNET:
      case networkIds.ARBITRUM_MAINNET:
      case networkIds.ETHEREUM_MAINNET:
      case networkIds.ETHEREUM_GOERLI:
        return resolve(constants.blockchainType.EVM)
      default:
        return reject(new Error(`Unknown chain ID ${_networkId}`))
    }
  })

module.exports = { getBlockchainTypeFromChainId }
