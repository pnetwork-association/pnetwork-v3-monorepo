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
  getValidMatchingEventsAndPutInState,
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
const {
  filterOutInvalidQueuedRequestsAndPutInState,
} = require('./evm-validate-queued-requests')

const {
  maybeUpdateProposedEventsInDb,
  maybeUpdateDismissedEventsInDb,
} = require('../update-events-in-db')
const {
  removeProposalsEventsFromState,
  removeDismissedEventsFromState,
  removeDetectedEventsFromState,
} = require('../state/state-operations')

// TODO: configurable
const SLEEP_TIME = 1000

const maybeProcessNewRequestsAndPropose = _state =>
  logger.info('Polling for new requests EVM...') ||
  getOnChainQueuedRequestsAndPutInState(_state)
    .then(getDetectedEventsFromDbAndPutInState)
    .then(filterOutOnChainRequestsAndPutInState)
    .then(maybeBuildProposalsTxsAndPutInState)
    .then(removeDetectedEventsFromState)
    .then(maybeUpdateProposedEventsInDb)
    .then(removeProposalsEventsFromState)
    .then(logic.sleepThenReturnArg(SLEEP_TIME))

const maybeProcessNewRequestsAndDismiss = _state =>
  logger.info('Polling for new requests EVM...') ||
  getOnChainQueuedRequestsAndPutInState(_state)
    .then(getValidMatchingEventsAndPutInState)
    .then(filterOutInvalidQueuedRequestsAndPutInState)
    .then(removeDetectedEventsFromState)
    .then(maybeBuildDismissalTxsAndPutInState)
    .then(maybeUpdateDismissedEventsInDb)
    .then(removeDismissedEventsFromState)
    .then(logic.sleepThenReturnArg(SLEEP_TIME))

const INFINITE_LOOP = {
  rounds: logic.LOOP_MODE.INFINITE,
}

const pollForRequestsAndDismiss = _state =>
  logic
    .loop(INFINITE_LOOP, maybeProcessNewRequestsAndDismiss, [_state])
    .catch(pollForRequestsErrorHandler(pollForRequestsAndDismiss))

const pollForRequestsAndPropose = _state =>
  logic
    .loop(INFINITE_LOOP, maybeProcessNewRequestsAndPropose, [_state])
    .catch(pollForRequestsErrorHandler(pollForRequestsAndPropose))

module.exports = {
  maybeProcessNewRequestsAndDismiss,
  maybeProcessNewRequestsAndPropose,
  pollForRequestsAndDismiss,
  pollForRequestsAndPropose,
}
