const R = require('ramda')
const constants = require('ptokens-constants')
const { logger } = require('./get-logger')
const { db, utils } = require('ptokens-utils')

const { ERROR_NIL_ARGUMENTS } = require('./errors')

const extractReportsWithQuery = (_collection, _query) => db.findReports(_collection, _query)

const extractReportsWithNameAndChainIdAndStatus = R.curry(
  (_collection, _eventName, _networkId, _networkIdKey, _status) => {
    logger.info(
      `Getting events '${_eventName}' w/ status '${_status}' and ${_networkIdKey} '${_networkId}' from db...`
    )

    if (R.isNil(_eventName) || R.isNil(_networkId) || R.isNil(_networkIdKey) || R.isNil(_status)) {
      return Promise.reject(
        new Error(
          `${ERROR_NIL_ARGUMENTS}: _eventName: ${_eventName} _chainId: ${_networkId} _chainIdKey: ${_networkIdKey} status: ${_status}`
        )
      )
    }

    const query = {
      [constants.db.KEY_EVENT_NAME]: _eventName,
      [constants.db.KEY_STATUS]: _status,
      [_networkIdKey]: _networkId,
    }
    return extractReportsWithQuery(_collection, query).then(
      _reports =>
        logger.info(`Found ${_reports.length} events w/ status '${_status}' from db!`) || _reports
    )
  }
)

const createQueryFromIds = R.curry(
  (_eventName, _possibleIds) =>
    logger.info(`Extract '${_eventName}' reports for ${_possibleIds.join(' ')}`) ||
    Promise.resolve({
      [constants.db.KEY_OPERATION_ID]: {
        $in: _possibleIds,
      },
      [constants.db.KEY_EVENT_NAME]: {
        $eq: _eventName,
      },
    })
)

const extractReportsFromOnChainRequests = R.curry((_collection, _onChainRequests) =>
  utils
    .rejectIfNil(_onChainRequests, `On chains requests are undefined: ${_onChainRequests}`)
    .then(_ => Promise.all(_onChainRequests.map(utils.getEventId)))
    .then(createQueryFromIds(constants.db.eventNames.USER_OPERATION))
    .then(_query => extractReportsWithQuery(_collection, _query))
    .then(_reports => logger.info(`Found ${_reports.length} events into the db!`) || _reports)
)

module.exports = {
  extractReportsWithNameAndChainIdAndStatus,
  extractReportsFromOnChainRequests,
}
