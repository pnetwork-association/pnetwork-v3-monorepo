const R = require('ramda')
const ethers = require('ethers')
const {
  STATE_KEY_CHAIN_ID,
  STATE_KEY_PROVIDER_URL,
} = require('../state/constants')

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
    ? R.assoc('originatingChainId', _eventArgs.originChainId)
    : _eventArgs._originChainId
    ? R.assoc('originatingChainId', _eventArgs._originChainId)
    : R.assoc('originatingChainId', _dafaultChainId)

const maybeAddAmount = _eventArgs =>
  _eventArgs.value
    ? R.assoc('amount', _eventArgs.value)
    : _eventArgs._tokenAmount
    ? R.assoc('amount', _eventArgs._tokenAmount)
    : R.identity

const maybeAddDestinationAddress = _eventArgs =>
  _eventArgs._destinationAddress
    ? R.assoc('destinationAddress', _eventArgs._destinationAddress)
    : _eventArgs.underlyingAssetRecipient
    ? R.assoc('destinationAddress', _eventArgs.underlyingAssetRecipient)
    : R.identity

const maybeAddDestinationChainId = _eventArgs =>
  _eventArgs.destinationChainId
    ? R.assoc('destinationChainId', _eventArgs.destinationChainId)
    : _eventArgs._destinationChainId
    ? R.assoc('destinationChainId', _eventArgs._destinationChainId)
    : R.identity

const maybeAddUserData = _eventArgs =>
  _eventArgs.userData && _eventArgs.userData !== '0x'
    ? R.assoc('userData', _eventArgs.userData)
    : R.identity

const maybeAddTokenAddress = _eventArgs =>
  _eventArgs._tokenAddress
    ? R.assoc('tokenAddress', _eventArgs._tokenAddress)
    : R.identity

const buildStandardizedEventFromEvmEvent = R.curry((_state, _event) =>
  Promise.resolve({
    eventName: R.prop('name', _event),
    status: 'detected',
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
  Promise.resolve(_obj).then(R.assoc('originatingTxHash', _log.transactionHash))
)

const processEventLog = R.curry((_state, _interface, _callback, _log) =>
  Promise.resolve(_interface.parseLog(_log))
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
  ]).then(([_filter, _interface]) =>
    listenFromFilter(_state, _filter, _interface, _callback)
  )

module.exports = { listenForEvmEvent }
