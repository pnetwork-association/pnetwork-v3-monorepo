const R = require('ramda')
const ethers = require('ethers')
const {
  STATE_KEY_CHAIN_ID,
  STATE_KEY_EVENTS,
  STATE_KEY_PROVIDER_URL,
} = require('../state/constants')
const { constants: schemasConstants } = require('ptokens-schemas')
const { logger } = require('../get-logger')

const getEthersProvider = R.memoizeWith(R.identity, _url =>
  ethers.getDefaultProvider(_url)
)

const getEventFragment = _eventName =>
  ethers.utils.EventFragment.from(_eventName)

const getInterfaceFromEvent = _eventName =>
  Promise.resolve(getEventFragment(_eventName)).then(
    _fragment => new ethers.utils.Interface([_fragment])
  )

const addOriginatingChainId = (_eventArgs, _dafaultChainId) =>
  _eventArgs.originChainId
    ? R.assoc(
        schemasConstants.SCHEMA_ORIGINATING_CHAIN_ID_KEY,
        _eventArgs.originChainId
      )
    : _eventArgs._originChainId
    ? R.assoc(
        schemasConstants.SCHEMA_ORIGINATING_CHAIN_ID_KEY,
        _eventArgs._originChainId
      )
    : R.assoc(schemasConstants.SCHEMA_ORIGINATING_CHAIN_ID_KEY, _dafaultChainId)

const maybeAddAmount = _eventArgs =>
  _eventArgs.value
    ? R.assoc(schemasConstants.SCHEMA_AMOUNT_KEY, _eventArgs.value.toString())
    : _eventArgs._tokenAmount
    ? R.assoc(
        schemasConstants.SCHEMA_AMOUNT_KEY,
        _eventArgs._tokenAmount.toString()
      )
    : R.identity

const maybeAddDestinationAddress = _eventArgs =>
  _eventArgs._destinationAddress
    ? R.assoc(
        schemasConstants.SCHEMA_DESTINATION_ADDRESS_KEY,
        _eventArgs._destinationAddress
      )
    : _eventArgs.underlyingAssetRecipient
    ? R.assoc(
        schemasConstants.SCHEMA_DESTINATION_ADDRESS_KEY,
        _eventArgs.underlyingAssetRecipient
      )
    : R.identity

const maybeAddDestinationChainId = _eventArgs =>
  _eventArgs.destinationChainId
    ? R.assoc(
        schemasConstants.SCHEMA_DESTINATION_CHAIN_ID_KEY,
        _eventArgs.destinationChainId
      )
    : _eventArgs._destinationChainId
    ? R.assoc(
        schemasConstants.SCHEMA_DESTINATION_CHAIN_ID_KEY,
        _eventArgs._destinationChainId
      )
    : R.identity

const maybeAddUserData = _eventArgs =>
  _eventArgs.userData && _eventArgs.userData !== '0x'
    ? R.assoc(schemasConstants.SCHEMA_USER_DATA_KEY, _eventArgs.userData)
    : R.identity

const maybeAddTokenAddress = _eventArgs =>
  _eventArgs._tokenAddress
    ? R.assoc(
        schemasConstants.SCHEMA_TOKEN_ADDRESS_KEY,
        _eventArgs._tokenAddress
      )
    : R.identity

const buildStandardizedEventFromEvmEvent = R.curry((_state, _event) =>
  Promise.resolve({
    [schemasConstants.SCHEMA_EVENT_NAME_KEY]: R.prop('name', _event),
    [schemasConstants.SCHEMA_STATUS_KEY]: 'detected',
  })
    .then(addOriginatingChainId(_event.args, _state[STATE_KEY_CHAIN_ID]))
    .then(maybeAddAmount(_event.args))
    .then(maybeAddDestinationAddress(_event.args))
    .then(maybeAddDestinationChainId(_event.args))
    .then(maybeAddUserData(_event.args))
    .then(maybeAddTokenAddress(_event.args))
)

const getFilterObject = (_eventName, _tokenContract) =>
  Promise.resolve(getEventFragment(_eventName)).then(_frag => ({
    address: _tokenContract,
    topics: [ethers.utils.id(_frag.format())],
  }))

const addLogInfo = R.curry((_log, _obj) =>
  Promise.resolve(_obj).then(
    R.assoc(
      schemasConstants.SCHEMA_ORIGINATING_TRANSACTION_HASH_KEY,
      _log.transactionHash
    )
  )
)

const processEventLog = R.curry(
  (_state, _interface, _callback, _log) =>
    logger.info(`Received EVM event for transaction ${_log.transactionHash}`) ||
    Promise.resolve(_interface.parseLog(_log))
      .then(_parsedLog => logger.debug('Parsed EVM event log') || _parsedLog)
      .then(_parsedLog => logger.debug('name:', _parsedLog.name) || _parsedLog)
      .then(
        _parsedLog =>
          logger.debug('signature:', _parsedLog.signature) || _parsedLog
      )
      .then(_parsedLog => logger.debug('args:', _parsedLog.args) || _parsedLog)
      .then(buildStandardizedEventFromEvmEvent(_state))
      .then(addLogInfo(_log))
      .then(_callback)
)

const listenFromFilter = (_state, _filter, _interface, _callback) =>
  getEthersProvider(_state[STATE_KEY_PROVIDER_URL]).on(
    _filter,
    processEventLog(_state, _interface, _callback)
  )

const listenForEvmEvent = (_state, _eventName, _tokenContract, _callback) =>
  Promise.all([
    getFilterObject(_eventName, _tokenContract),
    getInterfaceFromEvent(_eventName),
  ]).then(
    ([_filter, _interface]) =>
      logger.info(`Listening to ${_eventName} at contract ${_tokenContract}`) ||
      listenFromFilter(_state, _filter, _interface, _callback)
  )

const startEvmListenerFromEventObject = (_state, _event, _callback) =>
  Promise.all(
    _event[schemasConstants.SCHEMA_TOKEN_CONTRACTS_KEY].map(_tokenContract =>
      listenForEvmEvent(_state, _event.name, _tokenContract, _callback)
    )
  )

const listenForEvmEvents = (_state, _callback) =>
  Promise.all(
    _state[STATE_KEY_EVENTS].map(_event =>
      startEvmListenerFromEventObject(_state, _event, _callback)
    )
  )

module.exports = { listenForEvmEvents }
