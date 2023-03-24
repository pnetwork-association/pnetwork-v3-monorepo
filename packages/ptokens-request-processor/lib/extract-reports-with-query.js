const { isNil, curry } = require('ramda')
const { logger } = require('./get-logger')
const { db } = require('ptokens-utils')
const schemas = require('ptokens-schemas')
const { ERROR_NIL_ARGUMENTS } = require('./errors')

const extractReportsWithQuery = (_collection, _query) =>
  db.findReports(_collection, _query)

const extractReportsWithChainIdAndStatus = curry(
  (_collection, _chainId, _status) => {
    logger.info(
      `Getting events w/ status '${_status}' and chainId '${_chainId}' from db...`
    )

    if (isNil(_chainId) || isNil(_status)) {
      return Promise.reject(
        new Error(
          `${ERROR_NIL_ARGUMENTS}: chainId: ${_chainId} status: ${_status}`
        )
      )
    }

    const query = {
      [schemas.constants.SCHEMA_STATUS_KEY]: _status,
      [schemas.constants.SCHEMA_DESTINATION_CHAIN_ID_KEY]: _chainId,
    }
    return extractReportsWithQuery(_collection, query).then(
      _reports =>
        logger.info(
          `Found ${_reports.length} events w/ status ${_status} into the db!`
        ) || _reports
    )
  }
)

const extractReportsWithChainIdAndTxHash = curry(
  (_collection, _chainId, _txHashes) => {
    logger.info(`Getting events w/ transaction hash ${_txHashes} from db...`)
    const query = {
      _id: {
        $in: _txHashes.map(schemas.db.access.getEventId(_chainId)),
      },
    }
    return extractReportsWithQuery(_collection, query).then(
      _reports =>
        logger.info(`Found ${_reports.length} events into the db!`) || _reports
    )
  }
)

module.exports = {
  extractReportsWithChainIdAndStatus,
  extractReportsWithChainIdAndTxHash,
}
