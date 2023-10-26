const { STATE_KEY_EVENTS } = require('../state/constants')
const { logger } = require('../get-logger')
const constants = require('ptokens-constants')
const {
  getEthersProvider,
  getInterfaceFromEventSignatures,
  getEventFilter,
  getTopicFromEventSignature,
} = require('./evm-utils')
const { processEventLog } = require('./evm-process-event-log')

const listenFromFilter = (_providerUrl, _networkId, _filter, _interface, _callback) =>
  logger.info(`Listening for event from ${_filter.address} with topics [${_filter.topics}]`) ||
  // Referring to https://github.com/ethers-io/ethers.js/issues/4104,
  // now getEthersProvider() returns a JsonRpcProvider with polling set to true,
  // thus using getLogs instead of filters, permitting to avoid the "filter not found".
  getEthersProvider(_providerUrl).then(_provider =>
    _provider.on(_filter, processEventLog(_networkId, _interface, _callback))
  )

const listenForEvmContractEvents = (
  _providerUrl,
  _networkId,
  _eventSignatures,
  _contractAddress,
  _callback
) =>
  Promise.all(_eventSignatures.map(getTopicFromEventSignature))
    .then(_topics =>
      Promise.all([
        getEventFilter({ topics: _topics, contractAddress: _contractAddress }),
        getInterfaceFromEventSignatures(_eventSignatures),
      ])
    )
    .then(
      ([_filter, _interface]) =>
        logger.info(`Listen to ${_eventSignatures} @ ${_contractAddress}`) ||
        listenFromFilter(_providerUrl, _networkId, _filter, _interface, _callback)
    )

const startEvmListenerFromEventObject = (_providerUrl, _networkId, _event, _callback) =>
  listenForEvmContractEvents(
    _providerUrl,
    _networkId,
    _event[constants.config.KEY_SIGNATURES],
    _event[constants.config.KEY_CONTRACT],
    _callback
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
