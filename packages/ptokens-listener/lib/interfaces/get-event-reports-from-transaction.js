const { constants: ptokensUtilsConstants, utils } = require('ptokens-utils')
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
    case ptokensUtilsConstants.blockchainType.EVM:
      return getEvmEventReportsFromTransaction
    case ptokensUtilsConstants.blockchainType.EOSIO:
      return getEosioEventReportsFromTransaction
    case ptokensUtilsConstants.blockchainType.UTXO:
      return getUtxoEventReportsFromTransaction
    case ptokensUtilsConstants.blockchainType.ALGORAND:
      return getAlgorandEventReportsFromTransaction
    default:
      return () => Promise.reject(new Error('Invalid blockchain type'))
  }
}

const getEventReportsFromTransaction = (
  _providerUrl,
  _chainId,
  _hash,
  _eventName
) =>
  utils
    .getBlockchainTypeFromChainId(_chainId)
    .then(getImplementationForBlockchainType)
    .then(_implementation =>
      _implementation(_providerUrl, _chainId, _hash, _eventName)
    )

module.exports = { getEventReportsFromTransaction }
