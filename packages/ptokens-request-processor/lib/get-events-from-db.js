const schemas = require('ptokens-schemas')
const { assoc, curry } = require('ramda')
const { logger } = require('./get-logger')
const { constants } = require('ptokens-utils')
const { STATE_DETECTED_DB_REPORTS_KEY } = require('./state/constants')
const { filterForValidReports } = require('./filter-for-valid-reports')
const {
  extractReportsWithChainIdAndStatus,
} = require('./extract-reports-with-chainid-and-status')

const getValidEventsWithStatusAndPutInState = curry((_status, _state) =>
  extractReportsWithChainIdAndStatus(
    _state[constants.STATE_KEY_DB],
    _state[schemas.constants.SCHEMA_CHAIN_ID_KEY],
    _status
  )
    .then(filterForValidReports)
    .then(
      _reports =>
        logger.info('Adding detected reports to state...') ||
        assoc(STATE_DETECTED_DB_REPORTS_KEY, _reports, _state)
    )
)

const getDetectedEventsFromDbAndPutInState =
  getValidEventsWithStatusAndPutInState(schemas.db.enums.txStatus.DETECTED)

const getProposedEventsFromDbAndPutInState =
  getValidEventsWithStatusAndPutInState(schemas.db.enums.txStatus.PROPOSED)

module.exports = {
  getDetectedEventsFromDbAndPutInState,
  getProposedEventsFromDbAndPutInState,
}
