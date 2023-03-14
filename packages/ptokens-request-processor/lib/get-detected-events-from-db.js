const { curry, assoc } = require('ramda')
const { logger } = require('../get-logger')
const { db, constants, utils, validation } = require('ptokens-utils')
const schemas = require('ptokens-schemas')
const { STATE_DETECTED_DB_REPORTS_KEY } = require('../state/constants')

const validateReportOrSetNull = _report =>
  validation
    .validateJson(schemas.db.collections.events, _report)
    .then(_ => _report)
    .catch(_err => {
      logger.warn('Invalid report detected, skipping...', _err)
      logger.warn(JSON.stringify(_report))
      return null
    })

const filterForValidReports = _reports =>
  logger.info(
    `Detected ${_reports.length} reports, filtering invalid ones...`
  ) ||
  Promise.all(_reports.map(validateReportOrSetNull)).then(_filteredReports =>
    _filteredReports.filter(utils.isNotNil)
  )

const extractReportsWithChainIdAndStatus = curry(
  (_collection, _chainId, _status) =>
    utils.getBlockchainTypeFromChainId(_chainId).then(_blockChainType => {
      logger.info(
        `Getting ${_blockChainType} requests w/ status ${_status} from db...`
      )
      const query = { [schemas.constants.SCHEMA_STATUS_KEY]: _status }
      return db
        .findReports(_collection, query)
        .then(filterForValidReports)
        .then(
          _reports =>
            logger.info(
              `Found ${_reports.length} events w/ status ${_status} into the db!`
            ) || _reports
        )
    })
)

const getNewRequestsFromDbAndPutInState = _state =>
  extractReportsWithChainIdAndStatus(
    _state[constants.STATE_KEY_DB],
    _state[schemas.constants.SCHEMA_CHAIN_ID_KEY],
    schemas.db.enums.txStatus.DETECTED
  ).then(
    _reports =>
      logger.info('Adding detected reports to state...') ||
      assoc(STATE_DETECTED_DB_REPORTS_KEY, _reports, _state)
  )

module.exports = {
  filterForValidReports,
  getNewRequestsFromDbAndPutInState,
}
