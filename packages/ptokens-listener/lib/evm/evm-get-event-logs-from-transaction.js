const R = require('ramda')
const {
  areTopicsMatching,
  getEthersProvider,
  getEventFilter,
  getTopicFromEventSignature,
} = require('./evm-utils')
const { logger } = require('../get-logger')

const maybeFilterLogsForMatchingTopics = R.curry((_logs, _filter) =>
  _filter.topics
    ? R.filter(areTopicsMatching(_filter), _logs)
    : logger.info('No topics has been found in logs!') || _logs
)

const getTransactionLogs = R.curry((_hash, _provider) =>
  _provider.getTransactionReceipt(_hash).then(R.prop('logs'))
)

const maybeFilterLogsByEventSignature = R.curry((_eventSignature, _logs) =>
  _eventSignature
    ? getTopicFromEventSignature(_eventSignature)
        .then(_topic => getEventFilter({ topics: _topic }))
        .then(maybeFilterLogsForMatchingTopics(_logs))
    : Promise.resolve(_logs)
)

const getEvmEventLogsFromTransaction = (_providerUrl, _hash, _eventSignature = null) =>
  getEthersProvider(_providerUrl)
    .then(getTransactionLogs(_hash))
    .then(maybeFilterLogsByEventSignature(_eventSignature))

module.exports = { getEvmEventLogsFromTransaction }
