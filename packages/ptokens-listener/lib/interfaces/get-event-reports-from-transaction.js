const constants = require('ptokens-constants')
const { utils } = require('ptokens-utils')
const {
  getEvmEventReportsFromTransaction,
} = require('../evm/evm-get-event-reports-from-transaction')
const { logger } = require('../get-logger')

const getEosioEventReportsFromTransaction = (_state, _callback) =>
  Promise.reject(new Error('To be implemented!'))
const getAlgorandEventReportsFromTransaction = (_state, _callback) =>
  Promise.reject(new Error('To be implemented!'))
const getUtxoEventReportsFromTransaction = (_state, _callback) =>
  Promise.reject(new Error('To be implemented!'))

const getImplementationForBlockchainType = _blockchainType => {
  logger.info(`Listen to ${_blockchainType} events`)
  switch (_blockchainType) {
    case constants.blockchainType.EVM:
      return getEvmEventReportsFromTransaction
    case constants.blockchainType.EOSIO:
      return getEosioEventReportsFromTransaction
    case constants.blockchainType.UTXO:
      return getUtxoEventReportsFromTransaction
    case constants.blockchainType.ALGORAND:
      return getAlgorandEventReportsFromTransaction
    default:
      return () => Promise.reject(new Error('Invalid blockchain type'))
  }
}

const getEventReportsFromTransaction = (_providerUrl, _networkId, _hash, _eventSignature) =>
  utils
    .getBlockchainTypeFromChainId(_networkId)
    .then(getImplementationForBlockchainType)
    .then(_implementation => _implementation(_providerUrl, _networkId, _hash, _eventSignature))

module.exports = { getEventReportsFromTransaction }
