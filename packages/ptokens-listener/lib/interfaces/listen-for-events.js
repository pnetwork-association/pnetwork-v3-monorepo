const { utils } = require('ptokens-utils')
const constants = require('ptokens-constants')
const { listenForEvmEvents } = require('../evm/evm-listen-for-events')
const { logger } = require('../get-logger')
const { insertReportIntoDb } = require('../insert-report-into-db')

const listenForEosioEvents = (_state, _callback) => Promise.reject(new Error('To be implemented!'))
const listenForAlgorandEvents = (_state, _callback) =>
  Promise.reject(new Error('To be implemented!'))
const listenForUtxoDeposits = (_state, _callback) => Promise.reject(new Error('To be implemented!'))

const getListenerForBlockchainType = _blockchainType => {
  logger.info(`Listen to ${_blockchainType} events`)
  switch (_blockchainType) {
    case constants.blockchainType.EVM:
      return listenForEvmEvents
    case constants.blockchainType.EOSIO:
      return listenForEosioEvents
    case constants.blockchainType.UTXO:
      return listenForUtxoDeposits
    case constants.blockchainType.ALGORAND:
      return listenForAlgorandEvents
    default:
      return () => Promise.reject(new Error('Invalid blockchain type'))
  }
}

process.on('unhandledRejection', (reason, p) => {
  logger.error('Unhandled Rejection at: Promise', p, 'reason:', reason)
  // application specific logging, throwing an error, or other logic here
  process.exit(1)
})

const listenForEvents = _state =>
  utils
    .getBlockchainTypeFromChainId(_state[constants.state.KEY_NETWORK_ID])
    .then(getListenerForBlockchainType)
    .then(_listener => _listener(_state, insertReportIntoDb(_state[constants.state.KEY_DB])))

module.exports = { listenForEvents }
