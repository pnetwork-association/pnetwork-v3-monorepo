const R = require('ramda')
const constants = require('ptokens-constants')
const { logger } = require('../get-logger')
const {
  STATE_DETECTED_DB_REPORTS,
  STATE_ONCHAIN_REQUESTS,
  STATE_PROPOSED_DB_REPORTS,
} = require('../state/constants')

const areRequestsIdsEqual = R.curry(
  (_report, _request) =>
    logger.debug('Queued request:\n', _request) ||
    logger.debug('Matching db report:\n', _report) ||
    _report[constants.db.KEY_ID] === _request[constants.db.KEY_ID]
)

const isAlreadyProcessedTxs = R.curry((_onChainTxs, _requestedTx) => {
  const list = _onChainTxs.map(areRequestsIdsEqual(_requestedTx))
  return R.any(R.identical(true), list)
})

const setRequestStatusToProposed = request =>
  R.assoc(constants.db.KEY_STATUS, constants.db.txStatus.PROPOSED, request)

const filterOutOnChainRequestsAndPutInState = _state =>
  new Promise(resolve => {
    logger.info('Getting EVM on chain requests and putting in state...')
    const detectedTxs = _state[STATE_DETECTED_DB_REPORTS]
    const onChainRequests = _state[STATE_ONCHAIN_REQUESTS]
    const alreadyProposedTxs = detectedTxs.filter(isAlreadyProcessedTxs(onChainRequests))
    const alreadyProposedRequests = alreadyProposedTxs.map(setRequestStatusToProposed)
    const toProcessRequests = detectedTxs.filter(
      R.complement(isAlreadyProcessedTxs(onChainRequests))
    )

    return resolve(
      R.assoc(
        STATE_DETECTED_DB_REPORTS,
        toProcessRequests,
        R.assoc(STATE_PROPOSED_DB_REPORTS, alreadyProposedRequests, _state)
      )
    )
  })

module.exports = {
  filterOutOnChainRequestsAndPutInState,
}
