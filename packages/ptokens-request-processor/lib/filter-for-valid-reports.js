const schemas = require('ptokens-schemas')
const { logger } = require('./get-logger')
const { utils, validation } = require('ptokens-utils')

const validateReportOrSetNull = _report =>
  validation
    .validateJson(schemas.db.collections.events, _report)
    .catch(_err => {
      logger.warn('Invalid report detected, skipping...', _err)
      logger.warn(JSON.stringify(_report))
      return null
    })

const filterForValidReports = _reports =>
  logger.info(
    `Detected ${_reports.length} reports, filtering invalid ones...`
  ) ||
  Promise.all(_reports.map(validateReportOrSetNull)).then(
    utils.removeNilsFromList
  )

module.exports = {
  filterForValidReports,
}
