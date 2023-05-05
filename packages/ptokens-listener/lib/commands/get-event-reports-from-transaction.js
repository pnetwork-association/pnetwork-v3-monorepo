const constants = require('ptokens-constants')

const { checkConfiguration } = require('../check-configuration')
const { getInitialStateFromConfiguration } = require('../populate-state-from-configuration')
const {
  getEventReportsFromTransaction,
} = require('../interfaces/get-event-reports-from-transaction')
const { insertReportIntoDb } = require('../insert-report-into-db')

const printReports = _reports =>
  // eslint-disable-next-line no-console
  (_reports && console.info(JSON.stringify(_reports))) || _reports

const insertReportsIntoDb = (_config, _reports) =>
  _reports
    ? getInitialStateFromConfiguration(_config).then(_state =>
        Promise.all(_reports.map(insertReportIntoDb(_state[constants.state.KEY_DB])))
      )
    : Promise.resolve(_reports)

const getEventReportsFromTransactionCommand = (_config, _hash, _eventSignature, _save = false) =>
  checkConfiguration(_config)
    .then(_config =>
      getEventReportsFromTransaction(
        _config[constants.config.KEY_PROVIDER_URL],
        _config[constants.config.KEY_NETWORK_ID],
        _hash,
        _eventSignature
      )
    )
    .then(printReports)
    .then(_reports => (_save ? insertReportsIntoDb(_config, _reports) : _reports))

module.exports = { getEventReportsFromTransactionCommand }
