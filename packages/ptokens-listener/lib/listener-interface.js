const R = require('ramda')
const { constants: ptokensUtilsConstants, utils, db } = require('ptokens-utils')
const constants = require('ptokens-constants')
const { listenForEvmEvents } = require('./evm/listener-evm')
const { logger } = require('./get-logger')

const listenForEosioEvents = (_state, _callback) =>
  Promise.reject(new Error('To be implemented!'))
const listenForAlgorandEvents = (_state, _callback) =>
  Promise.reject(new Error('To be implemented!'))
const listenForUtxoDeposits = (_state, _callback) =>
  Promise.reject(new Error('To be implemented!'))

const getListenerForBlockchainType = _blockchainType => {
  logger.info(`Listen to ${_blockchainType} events`)
  switch (_blockchainType) {
    case ptokensUtilsConstants.blockchainType.EVM:
      return listenForEvmEvents
    case ptokensUtilsConstants.blockchainType.EOSIO:
      return listenForEosioEvents
    case ptokensUtilsConstants.blockchainType.UTXO:
      return listenForUtxoDeposits
    case ptokensUtilsConstants.blockchainType.ALGORAND:
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
  utils
    .getBlockchainTypeFromChainId(_state[constants.state.STATE_KEY_CHAIN_ID])
    .then(getListenerForBlockchainType)
    .then(_listener =>
      _listener(_state, insertIntoDb(_state[constants.state.STATE_KEY_DB]))
    )

module.exports = { listenForEvents }
