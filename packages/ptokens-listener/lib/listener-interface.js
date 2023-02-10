const R = require('ramda')
const { constants } = require('ptokens-utils')
const { listenForEvmEvent } = require('./evm/listener-evm')
const { logger } = require('./get-logger')

const listenForEosioEvent = (_eventName, _tokenContract, _abi) => new Error('To be implemented!')
const listenForAlgorandEvent = (_eventName, _tokenContract, _abi) => new Error('To be implemented!')
const listenForUtxoDeposit = (_eventName, _tokenContract, _abi) => new Error('To be implemented!')

const BlockchainType = {
  EVM: 'EVM',
  EOSIO: 'EOSIO',
  ALGORAND: 'ALGORAND',
  UTXO: 'UTXO'
}

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
      return BlockchainType.EVM
    case constants.metadataChainIds.EOS_MAINNET:
    case constants.metadataChainIds.TELOS_MAINNET:
    case constants.metadataChainIds.EOS_JUNGLE_TESTNET:
    case constants.metadataChainIds.ULTRA_MAINNET:
    case constants.metadataChainIds.ULTRA_TESTNET:
    case constants.metadataChainIds.EOS_UNKNOWN:
    case constants.metadataChainIds.LIBRE_TESTNET:
    case constants.metadataChainIds.LIBRE_MAINNET:
    case constants.metadataChainIds.FIO_MAINNET:
      return BlockchainType.EOSIO
    case constants.metadataChainIds.BITCOIN_MAINNET:
    case constants.metadataChainIds.BITCOIN_TESTNET:
    case constants.metadataChainIds.BTC_UNKNOWN:
      return BlockchainType.UTXO
    case constants.metadataChainIds.ALGORAND_MAINNET:
      return BlockchainType.ALGORAND
    default:
      return new Error('Unknown chain ID')
  }
}

const getListenerForBlockchainType = _blockchainType => {
  switch (_blockchainType) {
    case BlockchainType.EVM:
      return listenForEvmEvent
    case BlockchainType.EOSIO:
      return listenForEosioEvent
    case BlockchainType.UTXO:
      return listenForUtxoDeposit
    case BlockchainType.ALGORAND:
      return listenForAlgorandEvent
    default:
      throw new Error('Invalid blockchain type')
  }
}

const listenForEvent = (_chainId, _eventName, _tokenContract, _callback) =>
  logger.info(`Listening to ${_eventName} at contract ${_tokenContract}`) ||
    getListenerForBlockchainType(getBlockchainTypeFromChainId(_chainId))(_eventName, _tokenContract, _callback)

const insertIntoDb = _obj => logger.info('Insert object into db', _obj)

const startListenersFromEventObject = R.curry((_chainId, _event) =>
  _event['account-names'].map(_tokenContract => listenForEvent(_chainId, _event.name, _tokenContract, insertIntoDb)))

const listenForEvents = _config =>
  _config.events.map(startListenersFromEventObject(_config['chain-id']))

module.exports = { listenForEvents }
