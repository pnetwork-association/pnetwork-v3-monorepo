const R = require('ramda')
const { constants, utils, db } = require('ptokens-utils')
const { listenForEvmEvent } = require('./evm/listener-evm')
const { logger } = require('./get-logger')
const { STATE_KEY_CHAIN_ID, STATE_KEY_EVENTS } = require('./state/constants')

const listenForEosioEvent = (_eventName, _tokenContract, _abi) =>
  Promise.reject(new Error('To be implemented!'))
const listenForAlgorandEvent = (_eventName, _tokenContract, _abi) =>
  Promise.reject(new Error('To be implemented!'))
const listenForUtxoDeposit = (_eventName, _tokenContract, _abi) =>
  Promise.reject(new Error('To be implemented!'))

const getListenerForBlockchainType = _blockchainType => {
  logger.info(`Listen to ${_blockchainType} events`)
  switch (_blockchainType) {
    case constants.blockchainType.EVM:
      return listenForEvmEvent
    case constants.blockchainType.EOSIO:
      return listenForEosioEvent
    case constants.blockchainType.UTXO:
      return listenForUtxoDeposit
    case constants.blockchainType.ALGORAND:
      return listenForAlgorandEvent
    default:
      return () => Promise.reject(new Error('Invalid blockchain type'))
  }
}

const listenForEvent = (_state, _eventName, _tokenContract, _callback) =>
  logger.info(`Listening to ${_eventName} at contract ${_tokenContract}`) ||
  getListenerForBlockchainType(
    utils.getBlockchainTypeFromChainId(_state[STATE_KEY_CHAIN_ID])
  )(_state, _eventName, _tokenContract, _callback)

const insertIntoDb = R.curry(
  (_collection, _obj) =>
    logger.info(
      `Insert event object into db for transaction ${_obj.originatingTxHash}`
    ) ||
    logger.debug(`Object to be inserted ${JSON.stringify(_obj)}`) ||
    db.insertReport(_collection, _obj)
)

const startListenersFromEventObject = R.curry((_state, _event, _callback) =>
  Promise.all(
    _event['token-contracts'].map(_tokenContract =>
      listenForEvent(_state, _event.name, _tokenContract, _callback)
    )
  )
)

const listenForEvents = _state =>
  Promise.all(
    _state[STATE_KEY_EVENTS].map(_event =>
      startListenersFromEventObject(
        _state,
        _event,
        insertIntoDb(_state[constants.STATE_KEY_DB])
      )
    )
  )

module.exports = { listenForEvents }
