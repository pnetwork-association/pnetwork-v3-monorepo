const R = require('ramda')
const { logger } = require('../get-logger')
const {
  STATE_DETECTED_DB_REPORTS_KEY,
  STATE_QUEUED_DB_REPORTS_KEY,
  STATE_TO_BE_DISMISSED_REQUESTS_KEY,
} = require('../state/constants')
const schemas = require('ptokens-schemas')

const isRequestInvalid = R.curry(
  (_detectedTxs, _request) =>
    !_detectedTxs.some(
      _detectedReport =>
        // check event ID is the same
        _detectedReport[schemas.constants.SCHEMA_ID_KEY].split('_')[1] ===
        _request[schemas.constants.SCHEMA_ID_KEY].split('_')[1]
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
