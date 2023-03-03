const constants = require('../constants')
const { identity, memoizeWith } = require('ramda')

const getBlockchainTypeFromChainId = memoizeWith(
  identity,
  _chainId =>
    new Promise((resolve, reject) => {
      switch (_chainId) {
        case constants.metadataChainIds.ETHEREUM_MAINNET:
        case constants.metadataChainIds.ETHEREUM_ROPSTEN:
        case constants.metadataChainIds.ETHEREUM_RINKEBY:
        case constants.metadataChainIds.BSC_MAINNET:
        case constants.metadataChainIds.XDAI_MAINNET:
        case constants.metadataChainIds.INTERIM_CHAIN:
        case constants.metadataChainIds.FANTOM_MAINNET:
        case constants.metadataChainIds.LUXOCHAIN_MAINNET:
        case constants.metadataChainIds.POLYGON_MAINNET:
        case constants.metadataChainIds.ARBITRUM_MAINNET:
        case constants.metadataChainIds.ETH_UNKNOWN:
          return resolve(constants.blockchainType.EVM)
        case constants.metadataChainIds.EOS_MAINNET:
        case constants.metadataChainIds.TELOS_MAINNET:
        case constants.metadataChainIds.EOS_JUNGLE_TESTNET:
        case constants.metadataChainIds.ULTRA_MAINNET:
        case constants.metadataChainIds.ULTRA_TESTNET:
        case constants.metadataChainIds.EOS_UNKNOWN:
        case constants.metadataChainIds.LIBRE_TESTNET:
        case constants.metadataChainIds.LIBRE_MAINNET:
        case constants.metadataChainIds.FIO_MAINNET:
          return resolve(constants.blockchainType.EOSIO)
        case constants.metadataChainIds.BITCOIN_MAINNET:
        case constants.metadataChainIds.BITCOIN_TESTNET:
        case constants.metadataChainIds.BTC_UNKNOWN:
          return resolve(constants.blockchainType.UTXO)
        case constants.metadataChainIds.ALGORAND_MAINNET:
          return resolve(constants.blockchainType.ALGORAND)
        default:
          return reject(new Error(`Unknown chain ID ${_chainId}`))
      }
    })
)

module.exports = { getBlockchainTypeFromChainId }
