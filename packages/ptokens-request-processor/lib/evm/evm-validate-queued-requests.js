const { assoc, curry } = require('ramda')
const { logger } = require('../get-logger')
const {
  STATE_DETECTED_DB_REPORTS_KEY,
  STATE_ONCHAIN_REQUESTS_KEY,
  STATE_TO_BE_DISMISSED_REQUESTS_KEY,
} = require('../state/constants')
const { constants } = require('ptokens-schemas')

const checkRequestAgainstMatchingReport = (_report, _request) =>
  _report[constants.SCHEMA_AMOUNT_KEY] ===
    _request[constants.SCHEMA_AMOUNT_KEY] &&
  _report[constants.SCHEMA_DESTINATION_ADDRESS_KEY] ===
    _request[constants.SCHEMA_DESTINATION_ADDRESS_KEY]

const filterIsInvalidRequest = curry((_detectedTxs, _request) => {
  const matchingReport = _detectedTxs.find(
    _element =>
      _element[constants.SCHEMA_ORIGINATING_TX_HASH_KEY] ===
      _request[constants.SCHEMA_ORIGINATING_TX_HASH_KEY]
  )
  return matchingReport
    ? !checkRequestAgainstMatchingReport(matchingReport, _request)
    : true
})

const filterOutInvalidQueuedRequestsAndPutInState = _state => {
  logger.info('Getting EVM on chain requests and putting in state...')
  const onChainRequests = _state[STATE_ONCHAIN_REQUESTS_KEY]
  const detectedTxs = _state[STATE_DETECTED_DB_REPORTS_KEY]
  const invalidRequests = onChainRequests.filter(
    filterIsInvalidRequest(detectedTxs)
  )
  // TODO: filter out on chain requests
  return Promise.resolve(
    assoc(STATE_TO_BE_DISMISSED_REQUESTS_KEY, invalidRequests, _state)
  )
}

module.exports = {
  filterOutInvalidQueuedRequestsAndPutInState,
}
