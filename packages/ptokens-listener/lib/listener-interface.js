const R = require('ramda')
const { constants, utils, db } = require('ptokens-utils')
const { listenForEvmEvents } = require('./evm/listener-evm')
const { logger } = require('./get-logger')
const { STATE_KEY_CHAIN_ID } = require('./state/constants')

const listenForEosioEvents = (_state, _callback) =>
  Promise.reject(new Error('To be implemented!'))
const listenForAlgorandEvents = (_state, _callback) =>
  Promise.reject(new Error('To be implemented!'))
const listenForUtxoDeposits = (_state, _callback) =>
  Promise.reject(new Error('To be implemented!'))

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

const insertIntoDb = R.curry(
  (_collection, _obj) =>
    logger.info(
      `Insert event object into db for transaction ${_obj.originatingTxHash}`
    ) ||
    logger.debug(`Object to be inserted ${JSON.stringify(_obj)}`) ||
    db.insertReport(_collection, _obj)
)

const listenForEvents = _state =>
  getListenerForBlockchainType(
    utils.getBlockchainTypeFromChainId(_state[STATE_KEY_CHAIN_ID])
  )(_state, insertIntoDb(_state[constants.STATE_KEY_DB]))

module.exports = { listenForEvents }
