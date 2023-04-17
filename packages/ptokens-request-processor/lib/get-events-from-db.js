const schemas = require('ptokens-schemas')
const R = require('ramda')
const { logger } = require('./get-logger')
const constants = require('ptokens-constants')
const {
  STATE_DETECTED_DB_REPORTS_KEY,
  STATE_PROPOSED_DB_REPORTS_KEY,
  STATE_ONCHAIN_REQUESTS_KEY,
} = require('./state/constants')
const { filterForValidReports } = require('./filter-for-valid-reports')
const {
  extractReportsWithChainIdAndStatus,
  extractReportsFromOnChainRequests,
} = require('./extract-reports-with-query')

const getValidEventsWithStatusAndPutInState = R.curry(
  (_status, _stateKey, _state) =>
    extractReportsWithChainIdAndStatus(
      _state[constants.state.STATE_KEY_DB],
      _state[constants.state.STATE_KEY_CHAIN_ID],
      _status
    )
      .then(filterForValidReports)
      .then(
        _reports =>
          logger.info(
            `Adding reports w/ status '${_status}' to state under '${_stateKey}' key`
          ) || R.assoc(_stateKey, _reports, _state)
      )
)

const getDetectedEventsFromDbAndPutInState =
  getValidEventsWithStatusAndPutInState(
    schemas.db.enums.txStatus.DETECTED,
    STATE_DETECTED_DB_REPORTS_KEY
  )

const getProposedEventsFromDbAndPutInState =
  getValidEventsWithStatusAndPutInState(
    schemas.db.enums.txStatus.PROPOSED,
    STATE_PROPOSED_DB_REPORTS_KEY
  )

const getValidMatchingEventsAndPutInState = _state =>
  extractReportsFromOnChainRequests(
    _state[constants.state.STATE_KEY_DB],
    _state[STATE_ONCHAIN_REQUESTS_KEY]
  )
    .then(filterForValidReports)
    .then(
      _reports =>
        logger.info('Adding detected reports to state...') ||
        R.assoc(STATE_DETECTED_DB_REPORTS_KEY, _reports, _state)
    )

module.exports = {
  getDetectedEventsFromDbAndPutInState,
  getProposedEventsFromDbAndPutInState,
  getValidMatchingEventsAndPutInState,
}
