const R = require('ramda')
const { getEvmEventLogsFromTransaction } = require('./evm-get-event-logs-from-transaction')
const { getInterfaceFromEvent, processEventLog } = require('./evm-utils')

const getEvmEventReportsFromTransaction = (_providerUrl, _networkId, _hash, _eventSignature) =>
  Promise.all([
    getEvmEventLogsFromTransaction(_providerUrl, _networkId, _hash, _eventSignature),
    getInterfaceFromEvent(_eventSignature),
  ]).then(([_logs, _interface]) =>
    Promise.all(_logs.map(processEventLog(_networkId, _interface, R.identity)))
  )

module.exports = { getEvmEventReportsFromTransaction }
