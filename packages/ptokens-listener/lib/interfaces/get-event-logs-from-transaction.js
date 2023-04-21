const { constants: ptokensUtilsConstants, utils } = require('ptokens-utils')
const { getEvmEventLogsFromTransaction } = require('../evm/evm-get-event-logs-from-transaction')
const { logger } = require('../get-logger')

const getEosioEventLogsFromTransaction = (_state, _callback) =>
  Promise.reject(new Error('To be implemented!'))
const getAlgorandEventLogsFromTransaction = (_state, _callback) =>
  Promise.reject(new Error('To be implemented!'))
const getUtxoEventLogsFromTransaction = (_state, _callback) =>
  Promise.reject(new Error('To be implemented!'))

const getImplementationForBlockchainType = _blockchainType => {
  logger.info(`Listen to ${_blockchainType} events`)
  switch (_blockchainType) {
    case ptokensUtilsConstants.blockchainType.EVM:
      return getEvmEventLogsFromTransaction
    case ptokensUtilsConstants.blockchainType.EOSIO:
      return getEosioEventLogsFromTransaction
    case ptokensUtilsConstants.blockchainType.UTXO:
      return getUtxoEventLogsFromTransaction
    case ptokensUtilsConstants.blockchainType.ALGORAND:
      return getAlgorandEventLogsFromTransaction
    default:
      return () => Promise.reject(new Error('Invalid blockchain type'))
  }
}

const getEventLogsFromTransaction = (_providerUrl, _networkId, _hash, _eventName) =>
  utils
    .getBlockchainTypeFromChainId(_networkId)
    .then(getImplementationForBlockchainType)
    .then(_implementation => _implementation(_providerUrl, _networkId, _hash, _eventName))

module.exports = { getEventLogsFromTransaction }
