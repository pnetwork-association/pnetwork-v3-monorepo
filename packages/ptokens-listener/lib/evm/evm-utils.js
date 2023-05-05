const ethers = require('ethers')
const R = require('ramda')
const { validation } = require('ptokens-utils')
const { logger } = require('../get-logger')

const getEthersProvider = R.memoizeWith(R.identity, _url =>
  validation.checkType('String', _url).then(_ => ethers.getDefaultProvider(_url))
)

const getEventFragment = _eventSignature =>
  Promise.resolve(ethers.EventFragment.from(_eventSignature))

const createInterface = _fragments => Promise.resolve(new ethers.Interface(_fragments))

const getInterfaceFromEvent = _eventSignature =>
  getEventFragment(_eventSignature).then(Array.of).then(createInterface)

const keccak256 = _string => ethers.id(_string)

const maybeAddTopicsToFilter = R.curry((_eventSignature, _filter) =>
  _eventSignature
    ? getEventFragment(_eventSignature).then(_fragment =>
        R.assoc('topics', [keccak256(_fragment.format())], _filter)
      )
    : Promise.resolve(_filter)
)

const maybeAddAddressToFilter = R.curry((_contractAddress, _filter) =>
  _contractAddress ? R.assoc('address', _contractAddress, _filter) : Promise.resolve(_filter)
)

const getFilter = (_eventSignature, _contractAddress) =>
  Promise.resolve({})
    .then(maybeAddTopicsToFilter(_eventSignature))
    .then(maybeAddAddressToFilter(_contractAddress))

const areTopicsMatching = R.curry((_filter, _log) => R.equals(_filter.topics, _log.topics))

const { buildStandardizedEvmEventObjectFromLog } = require('./evm-build-standardized-event.js')

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
