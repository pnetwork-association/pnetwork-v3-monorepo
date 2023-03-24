const { curry } = require('ramda')
const { logic } = require('ptokens-utils')
const { logger } = require('../get-logger')
const {
  getOnChainQueuedRequestsAndPutInState,
} = require('./evm-get-on-chain-queued-requests')
const { getValidMatchingEventsAndPutInState } = require('../get-events-from-db')
const {
  maybeBuildDismissalTxsAndPutInState,
} = require('./evm-build-dismissal-txs')
const {
  filterOutInvalidQueuedRequestsAndPutInState,
} = require('./evm-validate-queued-requests')
const { maybeUpdateDismissedEventsInDb } = require('../update-events-in-db')
const {
  removeDismissedEventsFromState,
  removeDetectedEventsFromState,
} = require('../state/state-operations')

// TODO: configurable
const SLEEP_TIME = 1000

const pollForRequestsErrorHandler = curry((_pollForRequestsLoop, _err) => {
  return Promise.reject(_err)
})

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

module.exports = {
  pollForRequestsAndDismiss,
  maybeProcessNewRequestsAndDismiss,
}
