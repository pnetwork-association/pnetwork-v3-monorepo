const R = require('ramda')
const { constants, utils, db } = require('ptokens-utils')
const { listenForEvmEvent } = require('./evm/listener-evm')
const { logger } = require('./get-logger')

const listenForEosioEvent = (_eventName, _tokenContract, _abi) =>
  Promise.reject(new Error('To be implemented!'))
const listenForAlgorandEvent = (_eventName, _tokenContract, _abi) =>
  Promise.reject(new Error('To be implemented!'))
const listenForUtxoDeposit = (_eventName, _tokenContract, _abi) =>
  Promise.reject(new Error('To be implemented!'))

const getListenerForBlockchainType = _blockchainType => {
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
      throw new Error('Invalid blockchain type')
  }
}

const listenForEvent = (_chainId, _eventName, _tokenContract, _callback) =>
  logger.info(`Listening to ${_eventName} at contract ${_tokenContract}`) ||
  getListenerForBlockchainType(utils.getBlockchainTypeFromChainId(_chainId))(
    _eventName,
    _tokenContract,
    _callback
  )

const insertIntoDb = R.curry((_collection, _obj) =>
  db.insertReport(_collection, _obj)
)

const startListenersFromEventObject = R.curry((_chainId, _event, _callback) =>
  _event['account-names'].map(_tokenContract =>
    listenForEvent(_chainId, _event.name, _tokenContract, _callback)
  )
)

const listenForEvents = _state =>
  _state.eventsToListen.map(_event =>
    startListenersFromEventObject(
      _state['chain-id'],
      _event,
      insertIntoDb(_state[constants.STATE_KEY_DB])
    )
  )

module.exports = { listenForEvents }
