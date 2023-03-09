const { assoc } = require('ramda')
const { logger } = require('../get-logger')
const { db, utils, validation } = require('ptokens-utils')
const { constants: schemasConstants, dbSchema } = require('ptokens-schemas')
const { STATE_DETECTED_DB_REPORTS_KEY } = require('../state/constants')

const validateReportOrSetNull = _report =>
  validation
    .validateJson(dbSchema, _report)
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

const getNewRequestsFromDbAndPutInState = _state =>
  utils
    .getBlockchainTypeFromChainId(_state[schemasConstants.SCHEMA_CHAIN_ID_KEY])
    .then(_blockchainType => {
      logger.info(`Gettting ${_blockchainType} requests from db...`)
      const query = {
        [schemasConstants.SCHEMA_STATUS_KEY]:
          schemasConstants.enums.txStatus.DETECTED,
      }
      return db
        .findReports(query)
        .then(filterForValidReports)
        .then(
          _reports =>
            logger.info(
              `Found ${_reports.length} into the db ready to be processed...`
            ) || _reports
        )
        .then(_reports =>
          assoc(STATE_DETECTED_DB_REPORTS_KEY, _reports, _state)
        )
    })

module.exports = {
  filterForValidReports,
  getNewRequestsFromDbAndPutInState,
}
