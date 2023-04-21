const R = require('ramda')
const { logger } = require('./get-logger')
const constants = require('ptokens-constants')
const {
  STATE_DETECTED_DB_REPORTS,
  STATE_PROPOSED_DB_REPORTS,
  STATE_QUEUED_DB_REPORTS,
} = require('./state/constants')
const { filterForValidReports } = require('./filter-for-valid-reports')
const {
  extractReportsWithNameAndChainIdAndStatus,
  extractReportsFromOnChainRequests,
} = require('./extract-reports-with-query')

const getValidEventsWithStatusAndPutInState = R.curry(
  (_status, _stateKey, _networkIdKey, _eventName, _state) =>
    extractReportsWithNameAndChainIdAndStatus(
      _state[constants.state.KEY_DB],
      _eventName,
      _state[constants.state.KEY_NETWORK_ID],
      _networkIdKey,
      _status
    )
      .then(filterForValidReports)
      .then(
        _reports =>
          logger.info(`Adding reports w/ status '${_status}' to state under '${_stateKey}' key`) ||
          R.assoc(_stateKey, _reports, _state)
      )
)

const getDetectedEventsFromDbAndPutInState = _state =>
  getValidEventsWithStatusAndPutInState(
    constants.db.txStatus.DETECTED,
    STATE_DETECTED_DB_REPORTS,
    constants.db.KEY_DESTINATION_NETWORK_ID,
    'UserOperation',
    _state
  )

const getQueuedEventsFromDbAndPutInState = _state =>
  getValidEventsWithStatusAndPutInState(
    constants.db.txStatus.DETECTED,
    STATE_QUEUED_DB_REPORTS,
    constants.db.KEY_ORIGINATING_NETWORK_ID,
    'OperationQueued',
    _state
  )

const getProposedEventsFromDbAndPutInState = _state =>
  getValidEventsWithStatusAndPutInState(
    constants.db.txStatus.PROPOSED,
    STATE_PROPOSED_DB_REPORTS,
    constants.db.KEY_DESTINATION_NETWORK_ID,
    'UserOperation',
    _state
  )

const getValidMatchingEventsAndPutInState = _state =>
  extractReportsFromOnChainRequests(_state[constants.state.KEY_DB], _state[STATE_QUEUED_DB_REPORTS])
    .then(filterForValidReports)
    .then(
      _reports =>
        logger.info('Adding detected reports to state...') ||
        R.assoc(STATE_DETECTED_DB_REPORTS, _reports, _state)
    )

module.exports = {
  getDetectedEventsFromDbAndPutInState,
  getQueuedEventsFromDbAndPutInState,
  getProposedEventsFromDbAndPutInState,
  getValidMatchingEventsAndPutInState,
}
