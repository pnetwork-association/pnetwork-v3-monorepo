const R = require('ramda')
const { constants, utils } = require('ptokens-utils')
const { listenForEvmEvent } = require('./evm/listener-evm')
const { logger } = require('./get-logger')

const listenForEosioEvent = (_eventName, _tokenContract, _abi) => Promise.reject(new Error('To be implemented!'))
const listenForAlgorandEvent = (_eventName, _tokenContract, _abi) => Promise.reject(new Error('To be implemented!'))
const listenForUtxoDeposit = (_eventName, _tokenContract, _abi) => Promise.reject(new Error('To be implemented!'))

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
    getListenerForBlockchainType(utils.getBlockchainTypeFromChainId(_chainId))(_eventName, _tokenContract, _callback)

const insertIntoDb = _obj => logger.info('Insert object into db', _obj)

const startListenersFromEventObject = R.curry((_chainId, _event) =>
  _event['account-names'].map(_tokenContract => listenForEvent(_chainId, _event.name, _tokenContract, insertIntoDb)))

const listenForEvents = _config =>
  _config.events.map(startListenersFromEventObject(_config['chain-id']))

module.exports = { listenForEvents }
