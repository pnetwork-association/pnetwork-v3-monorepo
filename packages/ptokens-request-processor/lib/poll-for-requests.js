const { logic } = require('ptokens-utils')
const { logger } = require('./get-logger')
const {
  pollForRequestsErrorHandler,
} = require('./poll-for-requests-error-handler')
const {
  getOnChainQueuedRequestsAndPutInState,
} = require('./get-on-chain-queued-requests')
const {
  getNewRequestsFromDbAndPutInState,
} = require('./get-new-requests-from-db')
const { maybeBuildProposalsTxsAndPutInState } = require('./build-proposals-txs')
const { maybeBroadcastTxs } = require('./broadcast-txs')

// TODO: configurable
const SLEEP_TIME = 1000

const maybeProcessNewRequests = _state =>
  logger.info('Polling for new requests...') ||
  getOnChainQueuedRequestsAndPutInState(_state)
    .then(getNewRequestsFromDbAndPutInState)
    .then(maybeBuildProposalsTxsAndPutInState)
    .then(maybeBroadcastTxs)
    .then(logic.sleepThenReturnArg(SLEEP_TIME))

const INFINITE_LOOP = {
  rounds: logic.LOOP_MODE.INFINITE,
}

const pollForRequests = _state =>
  logic
    .loop(INFINITE_LOOP, maybeProcessNewRequests, [_state])
    .catch(pollForRequestsErrorHandler(pollForRequests))

module.exports = {
  pollForRequests,
}
