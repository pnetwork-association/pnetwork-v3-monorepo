const { curry } = require('ramda')
const { logic } = require('ptokens-utils')
const { logger } = require('../get-logger')
const {
  pollForRequestsErrorHandler,
} = require('./evm-poll-for-requests-error-handler')
const {
  getOnChainQueuedRequestsAndPutInState,
} = require('./evm-get-on-chain-queued-requests')
const {
  getDetectedEventsFromDbAndPutInState,
} = require('../get-events-from-db')
const {
  maybeBuildProposalsTxsAndPutInState,
} = require('./evm-build-proposals-txs')
const {
  maybeBuildDismissalTxsAndPutInState,
} = require('./evm-build-dismissal-txs')
const {
  filterOutOnChainRequestsAndPutInState,
} = require('./evm-filter-out-onchain-requests')

// TODO: configurable
const SLEEP_TIME = 1000

const maybeProcessNewRequests = curry(
  (_processFunction, _state) =>
    logger.info('Polling for new requests EVM...') ||
    getOnChainQueuedRequestsAndPutInState(_state)
      .then(getDetectedEventsFromDbAndPutInState)
      .then(_processFunction)
      .then(logic.sleepThenReturnArg(SLEEP_TIME))
)

const filterOutOnChainRequestsAndBuildDismissals = _state =>
  filterOutOnChainRequestsAndPutInState(_state).then(
    maybeBuildDismissalTxsAndPutInState
  )

const filterOutOnChainRequestsAndBuildProposals = _state =>
  filterOutOnChainRequestsAndPutInState(_state).then(
    maybeBuildProposalsTxsAndPutInState
  )

const INFINITE_LOOP = {
  rounds: logic.LOOP_MODE.INFINITE,
}

const pollForRequestsAndDismiss = _state =>
  logic
    .loop(
      INFINITE_LOOP,
      maybeProcessNewRequests(filterOutOnChainRequestsAndBuildDismissals),
      [_state]
    )
    .catch(pollForRequestsErrorHandler(pollForRequestsAndDismiss))

const pollForRequestsAndPropose = _state =>
  logic
    .loop(
      INFINITE_LOOP,
      maybeProcessNewRequests(filterOutOnChainRequestsAndBuildProposals),
      [_state]
    )
    .catch(pollForRequestsErrorHandler(pollForRequestsAndPropose))

module.exports = {
  pollForRequestsAndDismiss,
  pollForRequestsAndPropose,
}
