const R = require('ramda')
const { logger } = require('../get-logger')
const { buildStandardizedEvmEventObjectFromLog } = require('./evm-build-standardized-event.js')

const processEventLog = R.curry(
  (_networkId, _interface, _callback, _log) =>
    logger.info(`Received EVM event for transaction ${_log.transactionHash}`) ||
    buildStandardizedEvmEventObjectFromLog(_networkId, _interface, _log)
      // TODO: Validate event schema before inserting
      .then(_callback)
)

module.exports = {
  processEventLog,
}
