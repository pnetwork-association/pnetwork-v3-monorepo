const { utils } = require('ptokens-utils')
const constants = require('ptokens-constants')
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
    case constants.blockchainType.EVM:
      return getEvmEventLogsFromTransaction
    case constants.blockchainType.EOSIO:
      return getEosioEventLogsFromTransaction
    case constants.blockchainType.UTXO:
      return getUtxoEventLogsFromTransaction
    case constants.blockchainType.ALGORAND:
      return getAlgorandEventLogsFromTransaction
    default:
      return () => Promise.reject(new Error('Invalid blockchain type'))
  }
}

const getEventLogsFromTransaction = (_providerUrl, _networkId, _hash, _eventSignature) =>
  utils
    .getBlockchainTypeFromChainId(_networkId)
    .then(getImplementationForBlockchainType)
    .then(_implementation => _implementation(_providerUrl, _hash, _eventSignature))

module.exports = { getEventLogsFromTransaction }
