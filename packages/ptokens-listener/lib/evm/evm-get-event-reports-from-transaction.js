const R = require('ramda')
const {
  getEvmEventLogsFromTransaction,
} = require('./evm-get-event-logs-from-transaction')
const { getInterfaceFromEvent, processEventLog } = require('./evm-utils')

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

module.exports = { getEvmEventReportsFromTransaction }
