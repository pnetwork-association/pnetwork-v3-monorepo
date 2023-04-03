const ethers = require('ethers')
const { STATE_KEY_EVENTS } = require('../state/constants')
const { logger } = require('../get-logger')
const { validation } = require('ptokens-utils')
const constants = require('ptokens-constants')
const schemas = require('ptokens-schemas')
const { curry, identity, memoizeWith } = require('ramda')
const {
  buildStandardizedEvmEventObjectFromLog,
} = require('./evm-build-standardized-event.js')

const getEthersProvider = memoizeWith(identity, _url =>
  ethers.getDefaultProvider(_url)
)

const getEventFragment = _eventName =>
  Promise.resolve(ethers.EventFragment.from(_eventName))

const createInterface = _fragments =>
  Promise.resolve(new ethers.Interface(_fragments))

const getInterfaceFromEvent = _eventName =>
  getEventFragment(_eventName).then(Array.of).then(createInterface)

const getFilterObject = (_eventName, _tokenContract) =>
  getEventFragment(_eventName).then(_frag => ({
    address: _tokenContract,
    topics: [ethers.id(_frag.format())],
  }))

const processEventLog = curry(
  (_chainId, _interface, _callback, _log) =>
    logger.info(`Received EVM event for transaction ${_log.transactionHash}`) ||
    buildStandardizedEvmEventObjectFromLog(_chainId, _interface, _log)
      // TODO: Validate event schema before inserting
      .then(_callback)
)

const listenFromFilter = (
  _providerUrl,
  _chainId,
  _filter,
  _interface,
  _callback
) =>
  logger.info(
    `Listening for event from ${_filter.address} with topics [${_filter.topics}]`
  ) ||
  validation
    .checkType('String', _providerUrl)
    .then(_ => getEthersProvider(_providerUrl))
    .then(_provider =>
      _provider.on(_filter, processEventLog(_chainId, _interface, _callback))
    )

const listenForEvmEvent = (
  _providerUrl,
  _chainId,
  _eventName,
  _tokenContract,
  _callback
) =>
  Promise.all([
    getFilterObject(_eventName, _tokenContract),
    getInterfaceFromEvent(_eventName),
  ]).then(
    ([_filter, _interface]) =>
      logger.info(`Listening to ${_eventName} @ ${_tokenContract}`) ||
      listenFromFilter(_providerUrl, _chainId, _filter, _interface, _callback)
  )

const startEvmListenerFromEventObject = (
  _providerUrl,
  _chainId,
  _event,
  _callback
) =>
  Promise.all(
    _event[schemas.constants.SCHEMA_TOKEN_CONTRACTS_KEY].map(_tokenContract =>
      listenForEvmEvent(
        _providerUrl,
        _chainId,
        _event.name,
        _tokenContract,
        _callback
      )
    )
  )

const listenForEvmEvents = (_state, _callback) =>
  Promise.all(
    _state[STATE_KEY_EVENTS].map(_event =>
      startEvmListenerFromEventObject(
        _state[constants.state.STATE_KEY_PROVIDER_URL],
        _state[constants.state.STATE_KEY_CHAIN_ID],
        _event,
        _callback
      )
    )
  )

module.exports = {
  getEthersProvider,
  listenForEvmEvents,
  getInterfaceFromEvent,
}
