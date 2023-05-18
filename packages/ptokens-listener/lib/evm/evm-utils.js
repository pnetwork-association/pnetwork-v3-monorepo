const ethers = require('ethers')
const R = require('ramda')
const { validation } = require('ptokens-utils')
const constants = require('ptokens-constants')

const getEthersProvider = R.memoizeWith(R.identity, _url =>
  validation.checkType('String', _url).then(_ => ethers.getDefaultProvider(_url))
)

const isEventFragment = _fragment => ethers.Fragment.isEvent(_fragment)

const getTopicFromEventFragment = _fragment =>
  new Promise((resolve, reject) =>
    isEventFragment(_fragment)
      ? resolve(R.prop(constants.evm.ethers.TOPIC_HASH, _fragment))
      : reject(new Error('Invalid fragment'))
  )

const getEventFragment = _eventSignature =>
  Promise.resolve(ethers.EventFragment.from(_eventSignature))

const createInterface = _fragments => Promise.resolve(new ethers.Interface(_fragments))

const getInterfaceFromEvent = _eventSignature =>
  getEventFragment(_eventSignature).then(Array.of).then(createInterface)

const maybeAddTopicsToFilter = R.curry((_topics, _filter) =>
  (R.type(_topics) === 'String' && !R.isEmpty(_topics)) ||
  (R.type(_topics === 'Array') && !R.isEmpty(_topics))
    ? R.assoc('topics', [_topics], _filter)
    : _filter
)

const maybeAddAddressToFilter = R.curry((_contractAddress, _filter) =>
  _contractAddress ? R.assoc('address', _contractAddress, _filter) : _filter
)

const maybeAddFromBlockToFilter = R.curry((_fromBlock, _filter) =>
  _fromBlock ? R.assoc('fromBlock', _fromBlock, _filter) : _filter
)

const maybeAddToBlockToFilter = R.curry((toBlock, _filter) =>
  toBlock ? R.assoc('toBlock', toBlock, _filter) : _filter
)

/**
 * Create an event filter implementing ethers.js Filter interface (https://docs.ethers.org/v6/api/providers/#Filter).
 * @param {Object} params - An object specifying the filter properties.
 * @param {String|Array} params.topics - A string for a single topic or an array of topics to be looked for.
 * The filter will get events that have one ore more of the specified topics in their logs.
 * @param {string} params.contractAddress - The contract address to filter for events.
 * @param {number} params.fromBlock - The starting block to filter for events.
 * @param {number} params.toBlock - The ending block to filter for events.
 * @returns A filter object ethers.js Filter interface.
 */
const getEventFilter = ({ topics, contractAddress, fromBlock, toBlock }) =>
  Promise.resolve({})
    .then(maybeAddTopicsToFilter(topics))
    .then(maybeAddAddressToFilter(contractAddress))
    .then(maybeAddFromBlockToFilter(fromBlock))
    .then(maybeAddToBlockToFilter(toBlock))

const areTopicsMatching = R.curry((_filter, _log) =>
  R.equals(R.flatten(_filter.topics), _log.topics)
)

const createContract = (_contractAddress, _abi) =>
  Promise.resolve(new ethers.Contract(_contractAddress, _abi))

const getTopicFromEventSignature = _eventSignature =>
  getEventFragment(_eventSignature).then(getTopicFromEventFragment)

module.exports = {
  areTopicsMatching,
  createContract,
  getEthersProvider,
  getInterfaceFromEvent,
  getEventFilter,
  getTopicFromEventFragment,
  getTopicFromEventSignature,
  isEventFragment,
}
