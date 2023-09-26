const constants = require('../constants')

const getBlockchainTypeFromChainId = _networkId =>
  new Promise((resolve, reject) => {
    switch (_networkId) {
      case constants.networkIds.HARDHAT1:
      case constants.networkIds.HARDHAT2:
      case constants.networkIds.GNOSIS_MAINNET:
      case constants.networkIds.POLYGON_MAINNET:
      case constants.networkIds.ARBITRUM_MAINNET:
      case constants.networkIds.BSC_MAINNET:
      case constants.networkIds.ETHEREUM_MAINNET:
      case constants.networkIds.ETHEREUM_GOERLI:
        return resolve(constants.blockchainType.EVM)
      default:
        return reject(new Error(`Unknown chain ID ${_networkId}`))
    }
  })

module.exports = { getBlockchainTypeFromChainId }
