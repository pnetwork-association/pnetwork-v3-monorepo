const R = require('ramda')
const { logic } = require('ptokens-utils')
const { logger } = require('../get-logger')
const {
  getQueuedEventsFromDbAndPutInState,
  getValidMatchingEventsAndPutInState,
} = require('../get-events-from-db')
const { maybeSolveChallengesAndPutInState } = require('./evm-solve-challenge')
const { maybeBuildDismissalTxsAndPutInState } = require('./evm-build-dismissal-txs')
const { filterOutInvalidQueuedRequestsAndPutInState } = require('./evm-validate-queued-requests')
const { maybeGetPendingChallengesAndPutInState } = require('../get-pending-challenges')
const { maybeUpdateDismissedEventsInDb } = require('../update-events-in-db')
const {
  removePendingChallengesFromState,
  removeOnChainRequestsFromState,
  removeDismissedEventsFromState,
  removeDetectedEventsFromState,
  removeToBeDismissedEventsFromState,
} = require('../state/state-operations')
const constants = require('ptokens-constants')
const {
  filterOutQueuedOperationsWithWrongStatusAndPutInState,
} = require('./evm-filter-out-onchain-requests')
const evmCheckBalance = require('./evm-check-balance')

const pollForRequestsErrorHandler = R.curry((_pollForRequestsLoop, _err) => Promise.reject(_err))

const maybeProcessNewRequestsAndDismiss = _state =>
  logger.info('Checking for any EVM operations to cancel...') ||
  evmCheckBalance
    .checkBalance(_state)
    .then(getQueuedEventsFromDbAndPutInState)
    .then(filterOutQueuedOperationsWithWrongStatusAndPutInState)
    .then(getValidMatchingEventsAndPutInState)
    .then(filterOutInvalidQueuedRequestsAndPutInState)
    .then(removeOnChainRequestsFromState)
    .then(removeDetectedEventsFromState)
    .then(maybeBuildDismissalTxsAndPutInState)
    .then(maybeGetPendingChallengesAndPutInState)
    .then(maybeSolveChallengesAndPutInState)
    .then(maybeUpdateDismissedEventsInDb)
    .then(removeToBeDismissedEventsFromState)
    .then(removeDismissedEventsFromState)
    .then(removePendingChallengesFromState)
    .then(logic.sleepThenReturnArg(_state[constants.state.KEY_LOOP_SLEEP_TIME]))

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
