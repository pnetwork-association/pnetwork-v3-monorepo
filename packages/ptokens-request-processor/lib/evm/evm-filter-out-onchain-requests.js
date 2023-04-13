const R = require('ramda')
const { logger } = require('../get-logger')
const {
  STATE_DETECTED_DB_REPORTS_KEY,
  STATE_ONCHAIN_REQUESTS_KEY,
  STATE_PROPOSED_DB_REPORTS_KEY,
} = require('../state/constants')
const schemas = require('ptokens-schemas')

const areRequestsIdsEqual = R.curry(
  (_report, _request) =>
    logger.debug('Queued request:\n', _request) ||
    logger.debug('Matching db report:\n', _report) ||
    _report[schemas.constants.SCHEMA_ID_KEY] ===
      _request[schemas.constants.SCHEMA_ID_KEY]
)

const isAlreadyProcessedTxs = R.curry((_onChainTxs, _requestedTx) => {
  const list = _onChainTxs.map(areRequestsIdsEqual(_requestedTx))
  return R.any(R.identical(true), list)
})

const setRequestStatusToProposed = request =>
  R.assoc(
    schemas.constants.SCHEMA_STATUS_KEY,
    schemas.db.enums.txStatus.PROPOSED,
    request
  )

const filterOutOnChainRequestsAndPutInState = _state =>
  new Promise(resolve => {
    logger.info('Getting EVM on chain requests and putting in state...')
    const detectedTxs = _state[STATE_DETECTED_DB_REPORTS_KEY]
    const onChainRequests = _state[STATE_ONCHAIN_REQUESTS_KEY]
    const alreadyProposedTxs = detectedTxs.filter(
      isAlreadyProcessedTxs(onChainRequests)
    )
    const alreadyProposedRequests = alreadyProposedTxs.map(
      setRequestStatusToProposed
    )
    const toProcessRequests = detectedTxs.filter(
      R.complement(isAlreadyProcessedTxs(onChainRequests))
    )

    return resolve(
      R.assoc(
        STATE_DETECTED_DB_REPORTS_KEY,
        toProcessRequests,
        R.assoc(STATE_PROPOSED_DB_REPORTS_KEY, alreadyProposedRequests, _state)
      )
    )
  })

module.exports = {
  filterOutOnChainRequestsAndPutInState,
}
