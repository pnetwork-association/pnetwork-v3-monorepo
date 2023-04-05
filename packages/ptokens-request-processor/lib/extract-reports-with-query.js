const { isNil, curry, prop } = require('ramda')
const { logger } = require('./get-logger')
const { db, utils } = require('ptokens-utils')
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
      [schemas.constants.SCHEMA_DESTINATION_NETWORK_ID_KEY]: _chainId,
    }
    return extractReportsWithQuery(_collection, query).then(
      _reports =>
        logger.info(
          `Found ${_reports.length} events w/ status ${_status} from db!`
        ) || _reports
    )
  }
)

const getQueryForIdInArray = _possibleIds => ({
  _id: {
    $in: _possibleIds,
  },
})

const extractReportsFromOnChainRequests = curry(
  (_collection, _onChainRequests) => {
    logger.info(
      `Getting events w/ transaction hash ${_onChainRequests.map(
        prop(schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY)
      )} from db...`
    )

    if (isNil(_onChainRequests)) {
      return Promise.reject(
        new Error(`${ERROR_NIL_ARGUMENTS}: requests: ${_onChainRequests}`)
      )
    }

    return Promise.all(_onChainRequests.map(utils.getEventId))
      .then(getQueryForIdInArray)
      .then(_query => extractReportsWithQuery(_collection, _query))
      .then(
        _reports =>
          logger.info(`Found ${_reports.length} events into the db!`) ||
          _reports
      )
  }
)

module.exports = {
  extractReportsWithChainIdAndStatus,
  extractReportsFromOnChainRequests,
}
