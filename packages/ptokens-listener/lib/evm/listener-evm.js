const ethers = require('ethers')
const { STATE_KEY_EVENTS } = require('../state/constants')
const { logger } = require('../get-logger')
const { validation } = require('ptokens-utils')
const constants = require('ptokens-constants')
const schemas = require('ptokens-schemas')
const R = require('ramda')
const {
  buildStandardizedEvmEventObjectFromLog,
} = require('./evm-build-standardized-event.js')

const getEthersProvider = R.memoizeWith(R.identity, _url =>
  validation
    .checkType('String', _url)
    .then(_ => ethers.getDefaultProvider(_url))
)

const getEventFragment = _eventName =>
  Promise.resolve(ethers.EventFragment.from(_eventName))

const createInterface = _fragments =>
  Promise.resolve(new ethers.Interface(_fragments))

const getInterfaceFromEvent = _eventName =>
  getEventFragment(_eventName).then(Array.of).then(createInterface)

const keccak256 = _string => ethers.id(_string)

const maybeAddTopicsToFilter = R.curry((_eventName, _filter) =>
  _eventName
    ? getEventFragment(_eventName).then(_fragment =>
        R.assoc('topics', [keccak256(_fragment.format())], _filter)
      )
    : _filter
)

const maybeAddAddressToFilter = R.curry((_contractAddress, _filter) =>
  _contractAddress ? R.assoc('address', _contractAddress, _filter) : _filter
)

const getFilter = (_eventName, _contractAddress) =>
  Promise.resolve({})
    .then(maybeAddTopicsToFilter(_eventName))
    .then(maybeAddAddressToFilter(_contractAddress))

const processEventLog = R.curry(
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
  getEthersProvider(_providerUrl).then(_provider =>
    _provider.on(_filter, processEventLog(_chainId, _interface, _callback))
  )

const listenForEvmEvent = (
  _providerUrl,
  _chainId,
  _eventName,
  _contractAddress,
  _callback
) =>
  Promise.all([
    getFilter(_eventName, _contractAddress),
    getInterfaceFromEvent(_eventName),
  ]).then(
    ([_filter, _interface]) =>
      logger.info(`Listening to ${_eventName} @ ${_contractAddress}`) ||
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

const areTopicsMatching = R.curry((_filter, _log) =>
  R.equals(_filter.topics, _log.topics)
)

const getEvmEventLogsFromTransaction = (
  _providerUrl,
  _chainId,
  _hash,
  _eventName
) =>
  Promise.all([getFilter(_eventName), getEthersProvider(_providerUrl)]).then(
    ([_filter, _provider]) =>
      _provider
        .getTransactionReceipt(_hash)
        .then(R.prop('logs'))
        .then(_logs =>
          _filter.topics ? R.filter(areTopicsMatching(_filter), _logs) : _logs
        )
        .finally(() => _provider.websocket && _provider.websocket.close())
  )

const getEvmEventReportsFromTransaction = (
  _providerUrl,
  _chainId,
  _hash,
  _eventName
) =>
  Promise.all([
    getEvmEventLogsFromTransaction(_providerUrl, _chainId, _hash, _eventName),
    getInterfaceFromEvent(_eventName),
  ]).then(([_logs, _interface]) =>
    Promise.all(_logs.map(processEventLog(_chainId, _interface, R.identity)))
  )

module.exports = {
  getEthersProvider,
  listenForEvmEvents,
  getInterfaceFromEvent,
  getEvmEventLogsFromTransaction,
  getEvmEventReportsFromTransaction,
}
