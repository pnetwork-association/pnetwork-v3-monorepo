const { assoc, curry } = require('ramda')
const { logger } = require('../get-logger')
const {
  STATE_DETECTED_DB_REPORTS_KEY,
  STATE_ONCHAIN_REQUESTS_KEY,
  STATE_TO_BE_DISMISSED_REQUESTS_KEY,
} = require('../state/constants')
const schemas = require('ptokens-schemas')
const { utils } = require('ptokens-utils')

const checkRequestAgainstMatchingReport = (_report, _request) =>
  logger.debug('Queued request:\n', _request) ||
  logger.debug('Matching db report:\n', _report) ||
  (_report[schemas.constants.SCHEMA_AMOUNT_KEY] ===
    _request[schemas.constants.SCHEMA_AMOUNT_KEY] &&
    _report[schemas.constants.SCHEMA_DESTINATION_ADDRESS_KEY] ===
      _request[schemas.constants.SCHEMA_DESTINATION_ADDRESS_KEY] &&
    (_request[schemas.constants.SCHEMA_USER_DATA_KEY]
      ? _report[schemas.constants.SCHEMA_USER_DATA_KEY] ===
        _request[schemas.constants.SCHEMA_USER_DATA_KEY]
      : true))

const isRequestInvalid = curry((_detectedTxs, _request) => {
  const matchingReport = _detectedTxs.find(
    _element =>
      _element._id ===
      schemas.db.access.getEventId(
        _request[schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]
      )
  )
  return utils.isNotNil(matchingReport)
    ? logger.info(
        `Found a match for ${schemas.db.access.getEventId(
          _request[schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]
        )}...`
      ) || !checkRequestAgainstMatchingReport(matchingReport, _request)
    : true
})

const filterOutInvalidQueuedRequestsAndPutInState = _state => {
  logger.info('Getting EVM on chain requests and putting in state...')
  const onChainRequests = _state[STATE_ONCHAIN_REQUESTS_KEY]
  const detectedTxs = _state[STATE_DETECTED_DB_REPORTS_KEY]
  const invalidRequests = onChainRequests.filter(isRequestInvalid(detectedTxs))
  // TODO: filter out on chain requests
  logger.info('Invalid requests:\n', invalidRequests)
  return Promise.resolve(
    assoc(STATE_TO_BE_DISMISSED_REQUESTS_KEY, invalidRequests, _state)
  )
}

module.exports = {
  filterOutInvalidQueuedRequestsAndPutInState,
}
