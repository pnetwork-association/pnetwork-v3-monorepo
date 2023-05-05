const R = require('ramda')
const { areTopicsMatching, getEthersProvider, getFilter } = require('./evm-utils')

const getEvmEventLogsFromTransaction = (_providerUrl, _networkId, _hash, _eventSignature = null) =>
  Promise.all([getFilter(_eventSignature), getEthersProvider(_providerUrl)]).then(
    ([_filter, _provider]) =>
      _provider
        .getTransactionReceipt(_hash)
        .then(R.prop('logs'))
        .then(_logs => (_filter.topics ? R.filter(areTopicsMatching(_filter), _logs) : _logs))
        .finally(() => _provider.websocket && _provider.websocket.close())
  )

module.exports = { getEvmEventLogsFromTransaction }
