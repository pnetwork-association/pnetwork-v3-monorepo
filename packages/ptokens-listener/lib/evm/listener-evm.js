const ethers = require('ethers')
const { STATE_KEY_EVENTS } = require('../state/constants')
const { logger } = require('../get-logger')
const { validation } = require('ptokens-utils')
const schemas = require('ptokens-schemas')
const { curry, identity, memoizeWith } = require('ramda')
const {
  buildStandardizedEvmEventObjectFromLog,
} = require('./evm-build-standardized-event.js')

const getEthersProvider = memoizeWith(identity, _url =>
  ethers.getDefaultProvider(_url)
)

const getEventFragment = _eventName =>
  Promise.resolve(ethers.utils.EventFragment.from(_eventName))

const createInterface = _fragments =>
  Promise.resolve(new ethers.utils.Interface(_fragments))

const getInterfaceFromEvent = _eventName =>
  getEventFragment(_eventName).then(Array.of).then(createInterface)

const getFilterObject = (_eventName, _tokenContract) =>
  getEventFragment(_eventName).then(_frag => ({
    address: _tokenContract,
    topics: [ethers.utils.id(_frag.format())],
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
  _eventName,
  _interface,
  _callback
) =>
  logger.info(`Listening for event: ${_eventName}`) ||
  validation
    .checkType('String', _providerUrl)
    .then(_ => getEthersProvider(_providerUrl))
    .then(_provider =>
      _provider.on(_eventName, processEventLog(_chainId, _interface, _callback))
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
        _state[schemas.constants.SCHEMA_PROVIDER_URL_KEY],
        _state[schemas.constants.SCHEMA_CHAIN_ID_KEY],
        _event,
        _callback
      )
    )
  )

module.exports = {
  processEventLog,
  listenFromFilter,
  getEthersProvider,
  listenForEvmEvents,
  getInterfaceFromEvent,
}
