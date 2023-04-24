const constants = require('ptokens-constants')
const { checkConfiguration } = require('../check-configuration')
const { getEventLogsFromTransaction } = require('../interfaces/get-event-logs-from-transaction')

const printLogs = _logs =>
  // eslint-disable-next-line no-console
  (_logs && console.info(JSON.stringify(_logs))) || _logs

const getEventLogsFromTransactionCommand = (_config, _hash, _eventSignature, _options) =>
  checkConfiguration(_config)
    .then(_ =>
      getEventLogsFromTransaction(
        _config[constants.config.KEY_PROVIDER_URL],
        _config[constants.config.KEY_NETWORK_ID],
        _hash,
        _eventSignature
      )
    )
    .then(printLogs)

module.exports = { getEventLogsFromTransactionCommand }
