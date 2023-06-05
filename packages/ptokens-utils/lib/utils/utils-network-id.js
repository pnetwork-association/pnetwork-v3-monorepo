const constants = require('../constants')

const getBlockchainTypeFromChainId = _networkId =>
  new Promise((resolve, reject) => {
    switch (_networkId) {
      case constants.networkIds.ETHEREUM_MAINNET:
      case constants.networkIds.ETHEREUM_ROPSTEN:
      case constants.networkIds.ETHEREUM_RINKEBY:
      case constants.networkIds.ETHEREUM_SEPOLIA:
      case constants.networkIds.ETHEREUM_GOERLI:
      case constants.networkIds.BSC_MAINNET:
      case constants.networkIds.XDAI_MAINNET:
      case constants.networkIds.INTERIM_CHAIN:
      case constants.networkIds.FANTOM_MAINNET:
      case constants.networkIds.LUXOCHAIN_MAINNET:
      case constants.networkIds.POLYGON_MAINNET:
      case constants.networkIds.POLYGON_MUMBAI:
      case constants.networkIds.ARBITRUM_MAINNET:
      case constants.networkIds.ETH_UNKNOWN:
        return resolve(constants.blockchainType.EVM)
      case constants.networkIds.EOS_MAINNET:
      case constants.networkIds.TELOS_MAINNET:
      case constants.networkIds.EOS_JUNGLE_TESTNET:
      case constants.networkIds.ULTRA_MAINNET:
      case constants.networkIds.ULTRA_TESTNET:
      case constants.networkIds.EOS_UNKNOWN:
      case constants.networkIds.LIBRE_TESTNET:
      case constants.networkIds.LIBRE_MAINNET:
      case constants.networkIds.FIO_MAINNET:
        return resolve(constants.blockchainType.EOSIO)
      case constants.networkIds.BITCOIN_MAINNET:
      case constants.networkIds.BITCOIN_TESTNET:
      case constants.networkIds.BTC_UNKNOWN:
        return resolve(constants.blockchainType.UTXO)
      case constants.networkIds.ALGORAND_MAINNET:
        return resolve(constants.blockchainType.ALGORAND)
      default:
        return reject(new Error(`Unknown chain ID ${_networkId}`))
    }
  })

module.exports = { getBlockchainTypeFromChainId }
