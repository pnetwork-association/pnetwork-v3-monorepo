const R = require('ramda')
const constants = require('ptokens-constants')
const { logger } = require('./get-logger')

const addErrorToReport = R.curry((_report, _err) => {
  const id = _report[constants.db.KEY_ID]
  logger.debug(`Adding error to ${id.slice(0, 20)}...`)
  const timestamp = new Date().toISOString()
  _report[constants.db.KEY_FINAL_TX_TS] = timestamp
  _report[constants.db.KEY_STATUS] = constants.db.txStatus.FAILED
  _report[constants.db.KEY_ERROR] = _err.toString()

  return Promise.resolve(_report)
})

module.exports = {
  addErrorToReport,
}
