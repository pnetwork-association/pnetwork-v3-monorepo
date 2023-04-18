const R = require('ramda')
const { logic } = require('ptokens-utils')
const { logger } = require('../get-logger')
const {
  getOnChainQueuedRequestsAndPutInState,
} = require('./evm-get-on-chain-queued-requests')
const {
  getQueuedEventsFromDbAndPutInState,
  getValidMatchingEventsAndPutInState,
} = require('../get-events-from-db')
const {
  maybeBuildDismissalTxsAndPutInState,
} = require('./evm-build-dismissal-txs')
const {
  filterOutInvalidQueuedRequestsAndPutInState,
} = require('./evm-validate-queued-requests')
const { maybeUpdateDismissedEventsInDb } = require('../update-events-in-db')
const {
  removeOnChainRequestsFromState,
  removeDismissedEventsFromState,
  removeDetectedEventsFromState,
  removeToBeDismissedEventsFromState,
} = require('../state/state-operations')
const constants = require('ptokens-constants')

const pollForRequestsErrorHandler = R.curry((_pollForRequestsLoop, _err) => {
  return Promise.reject(_err)
})

const maybeProcessNewRequestsAndDismiss = _state =>
  logger.info('Polling for new requests EVM...') ||
  getOnChainQueuedRequestsAndPutInState(_state)
    .then(getQueuedEventsFromDbAndPutInState)
    .then(getValidMatchingEventsAndPutInState)
    .then(filterOutInvalidQueuedRequestsAndPutInState)
    .then(removeOnChainRequestsFromState)
    .then(removeDetectedEventsFromState)
    .then(maybeBuildDismissalTxsAndPutInState)
    .then(maybeUpdateDismissedEventsInDb)
    .then(removeToBeDismissedEventsFromState)
    .then(removeDismissedEventsFromState)
    .then(
      logic.sleepThenReturnArg(
        _state[constants.state.STATE_KEY_LOOP_SLEEP_TIME]
      )
    )

const INFINITE_LOOP = {
  rounds: logic.LOOP_MODE.INFINITE,
}

const pollForRequestsAndDismissLoop = _state =>
  logic
    .loop(INFINITE_LOOP, maybeProcessNewRequestsAndDismiss, [_state])
    .catch(pollForRequestsErrorHandler(pollForRequestsAndDismissLoop))

module.exports = {
  pollForRequestsAndDismissLoop,
  maybeProcessNewRequestsAndDismiss,
}
