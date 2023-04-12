const R = require('ramda')
const { logger } = require('../get-logger')
const {
  STATE_DETECTED_DB_REPORTS_KEY,
  STATE_QUEUED_DB_REPORTS_KEY,
  STATE_TO_BE_DISMISSED_REQUESTS_KEY,
} = require('../state/constants')
const schemas = require('ptokens-schemas')
const { utils } = require('ptokens-utils')

const checkRequestAgainstMatchingReport = (_report, _request) =>
  logger.debug('Queued request:\n', _request) ||
  logger.debug('Matching db report:\n', _report) ||
  (_report[schemas.constants.SCHEMA_ASSET_AMOUNT_KEY] ===
    _request[schemas.constants.SCHEMA_ASSET_AMOUNT_KEY] &&
    _report[schemas.constants.SCHEMA_DESTINATION_ACCOUNT_KEY] ===
      _request[schemas.constants.SCHEMA_DESTINATION_ACCOUNT_KEY] &&
    (_request[schemas.constants.SCHEMA_USER_DATA_KEY]
      ? _report[schemas.constants.SCHEMA_USER_DATA_KEY] ===
        _request[schemas.constants.SCHEMA_USER_DATA_KEY]
      : true))

const findMatchingReport = (_detectedTxs, _request) =>
  utils
    .getEventId(_request)
    .then(_id => _detectedTxs.find(_element => _element._id === _id))

const isRequestInvalid = R.curry((_detectedTxs, _request) =>
  findMatchingReport(_detectedTxs, _request).then(_matchingReport =>
    utils.isNotNil(_matchingReport)
      ? logger.info(
          `Found a match for ${
            _matchingReport[schemas.constants.SCHEMA_ID_KEY]
          }...`
        ) || !checkRequestAgainstMatchingReport(_matchingReport, _request)
      : true
  )
)
const filterOutInvalidQueuedRequestsAndPutInState = _state => {
  logger.info('Getting EVM on chain requests and putting in state...')
  const onChainRequests = _state[STATE_QUEUED_DB_REPORTS_KEY]
  const detectedTxs = _state[STATE_DETECTED_DB_REPORTS_KEY]
  return Promise.all(onChainRequests.map(isRequestInvalid(detectedTxs)))
    .then(_invalidArray =>
      onChainRequests.filter((_req, _i) => _invalidArray[_i])
    )
    .then(_invalidRequests =>
      R.assoc(STATE_TO_BE_DISMISSED_REQUESTS_KEY, _invalidRequests, _state)
    )
}

module.exports = {
  filterOutInvalidQueuedRequestsAndPutInState,
}
