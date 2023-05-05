const { STATE_KEY_EVENTS } = require('../state/constants')
const { logger } = require('../get-logger')
const constants = require('ptokens-constants')

const {
  getEthersProvider,
  getInterfaceFromEvent,
  getFilter,
  processEventLog,
} = require('./evm-utils')

const listenFromFilter = (_providerUrl, _networkId, _filter, _interface, _callback) =>
  logger.info(`Listening for event from ${_filter.address} with topics [${_filter.topics}]`) ||
  getEthersProvider(_providerUrl).then(_provider =>
    _provider.on(_filter, processEventLog(_networkId, _interface, _callback))
  )

const listenForEvmEvent = (
  _providerUrl,
  _networkId,
  _eventSignature,
  _contractAddress,
  _callback
) =>
  Promise.all([
    getFilter(_eventSignature, _contractAddress),
    getInterfaceFromEvent(_eventSignature),
  ]).then(
    ([_filter, _interface]) =>
      logger.info(`Listening to ${_eventSignature} @ ${_contractAddress}`) ||
      listenFromFilter(_providerUrl, _networkId, _filter, _interface, _callback)
  )

const startEvmListenerFromEventObject = (_providerUrl, _networkId, _event, _callback) =>
  Promise.all(
    _event[constants.config.KEY_CONTRACTS].map(_tokenContract =>
      listenForEvmEvent(_providerUrl, _networkId, _event.name, _tokenContract, _callback)
    )
  )

// this function will return a never-resolving Promise
// which will permit the EVM provider to listen indefinitely
const keepListening = () => new Promise(_ => {})

const listenForEvmEvents = (_state, _callback) =>
  Promise.all(
    _state[STATE_KEY_EVENTS].map(_event =>
      startEvmListenerFromEventObject(
        _state[constants.state.KEY_PROVIDER_URL],
        _state[constants.state.KEY_NETWORK_ID],
        _event,
        _callback
      )
    )
  ).then(keepListening)

module.exports = {
  listenForEvmEvents,
}
