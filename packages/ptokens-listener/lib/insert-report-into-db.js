const R = require('ramda')
const { utils } = require('ptokens-utils')
const constants = require('ptokens-constants')

const { db } = require('ptokens-utils')
const { logger } = require('./get-logger')

const insertReportIntoDb = R.curry(
  (_collection, _report) =>
    logger.info(
      `Insert event object into db for transaction ${_report[constants.db.KEY_TX_HASH]}`
    ) ||
    logger.debug(`Report to be inserted ${utils.stringifyJsonSync(_report)}`) ||
    db.insertReport(_collection, _report)
)

module.exports = { insertReportIntoDb }
