const R = require('ramda')
const constants = require('ptokens-constants')
const { logger } = require('../get-logger')
const {
  STATE_DETECTED_DB_REPORTS,
  STATE_QUEUED_DB_REPORTS,
  STATE_TO_BE_DISMISSED_REQUESTS,
} = require('../state/constants')

const isRequestInvalid = R.curry(
  (_detectedTxs, _request) =>
    !_detectedTxs.some(
      _detectedReport =>
        // check event ID is the same
        _detectedReport[constants.db.KEY_ID].split('_')[1] ===
        _request[constants.db.KEY_ID].split('_')[1]
    )
)
const filterOutInvalidQueuedRequestsAndPutInState = _state => {
  logger.info('Getting EVM on chain requests and putting in state...')
  const onChainRequests = _state[STATE_QUEUED_DB_REPORTS]
  const detectedTxs = _state[STATE_DETECTED_DB_REPORTS]
  return Promise.all(onChainRequests.map(isRequestInvalid(detectedTxs)))
    .then(_invalidArray => onChainRequests.filter((_req, _i) => _invalidArray[_i]))
    .then(_invalidRequests => R.assoc(STATE_TO_BE_DISMISSED_REQUESTS, _invalidRequests, _state))
}

module.exports = {
  filterOutInvalidQueuedRequestsAndPutInState,
}
