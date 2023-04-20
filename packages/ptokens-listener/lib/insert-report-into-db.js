const R = require('ramda')
const schemas = require('ptokens-schemas')
const { db } = require('ptokens-utils')
const { logger } = require('./get-logger')

const insertReportIntoDb = R.curry(
  (_collection, _report) =>
    logger.info(
      `Insert event object into db for transaction ${
        _report[schemas.constants.reportFields.SCHEMA_ORIGINATING_TX_HASH_KEY]
      }`
    ) ||
    logger.debug(`Report to be inserted ${JSON.stringify(_report)}`) ||
    db.insertReport(_collection, _report)
)

module.exports = { insertReportIntoDb }
