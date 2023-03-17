const schemas = require('ptokens-schemas')
const { assoc, curry, prop } = require('ramda')
const { logger } = require('./get-logger')
const { constants } = require('ptokens-utils')
const {
  STATE_DETECTED_DB_REPORTS_KEY,
  STATE_PROPOSED_DB_REPORTS_KEY,
  STATE_ONCHAIN_REQUESTS_KEY,
} = require('./state/constants')
const { filterForValidReports } = require('./filter-for-valid-reports')
const {
  extractReportsWithChainIdAndStatus,
} = require('./extract-reports-with-chainid-and-status')
const {
  extractReportsWithChainIdAndTxHash,
} = require('./extract-reports-with-chainid-and-tx-hash')

const getValidEventsWithStatusAndPutInState = curry(
  (_status, _stateKey, _state) =>
    extractReportsWithChainIdAndStatus(
      _state[constants.STATE_KEY_DB],
      _state[schemas.constants.SCHEMA_CHAIN_ID_KEY],
      _status
    )
      .then(filterForValidReports)
      .then(
        _reports =>
          logger.info(`Adding reports w/ status '${_status}' to state...`) ||
          assoc(_stateKey, _reports, _state)
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
  extractReportsWithChainIdAndTxHash(
    _state[constants.STATE_KEY_DB],
    _state[schemas.constants.SCHEMA_CHAIN_ID_KEY],
    _state[STATE_ONCHAIN_REQUESTS_KEY].map(
      prop(schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY)
    ) // TODO: create constant once the on-chain interface has been defined
  )
    .then(filterForValidReports)
    .then(
      _reports =>
        logger.info('Adding detected reports to state...') ||
        assoc(STATE_DETECTED_DB_REPORTS_KEY, _reports, _state)
    )

module.exports = {
  getDetectedEventsFromDbAndPutInState,
  getProposedEventsFromDbAndPutInState,
  getValidMatchingEventsAndPutInState,
}
