const ethers = require('ethers')
const R = require('ramda')
const { validation } = require('ptokens-utils')
const { logger } = require('../get-logger')

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

const areTopicsMatching = R.curry((_filter, _log) =>
  R.equals(_filter.topics, _log.topics)
)

const {
  buildStandardizedEvmEventObjectFromLog,
} = require('./evm-build-standardized-event.js')

const processEventLog = R.curry(
  (_networkId, _interface, _callback, _log) =>
    logger.info(`Received EVM event for transaction ${_log.transactionHash}`) ||
    buildStandardizedEvmEventObjectFromLog(_networkId, _interface, _log)
      // TODO: Validate event schema before inserting
      .then(_callback)
)

module.exports = {
  areTopicsMatching,
  getEthersProvider,
  getInterfaceFromEvent,
  getFilter,
  processEventLog,
}
