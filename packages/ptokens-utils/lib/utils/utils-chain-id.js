const constants = require('../constants')

const getBlockchainTypeFromChainId = _chainId => {
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
      return constants.blockchainType.EVM
    case constants.metadataChainIds.EOS_MAINNET:
    case constants.metadataChainIds.TELOS_MAINNET:
    case constants.metadataChainIds.EOS_JUNGLE_TESTNET:
    case constants.metadataChainIds.ULTRA_MAINNET:
    case constants.metadataChainIds.ULTRA_TESTNET:
    case constants.metadataChainIds.EOS_UNKNOWN:
    case constants.metadataChainIds.LIBRE_TESTNET:
    case constants.metadataChainIds.LIBRE_MAINNET:
    case constants.metadataChainIds.FIO_MAINNET:
      return constants.blockchainType.EOSIO
    case constants.metadataChainIds.BITCOIN_MAINNET:
    case constants.metadataChainIds.BITCOIN_TESTNET:
    case constants.metadataChainIds.BTC_UNKNOWN:
      return constants.blockchainType.UTXO
    case constants.metadataChainIds.ALGORAND_MAINNET:
      return constants.blockchainType.ALGORAND
    default:
      return new Error('Unknown chain ID')
  }
}

module.exports = { getBlockchainTypeFromChainId }
