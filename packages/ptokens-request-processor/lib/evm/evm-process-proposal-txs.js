const R = require('ramda')
const { logic } = require('ptokens-utils')
const { logger } = require('../get-logger')
const { getOnChainQueuedRequestsAndPutInState } = require('./evm-get-on-chain-queued-requests')
const { getDetectedEventsFromDbAndPutInState } = require('../get-events-from-db')
const { maybeBuildProposalsTxsAndPutInState } = require('./evm-build-proposals-txs')
const { filterOutOnChainRequestsAndPutInState } = require('./evm-filter-out-onchain-requests')
const { maybeUpdateProposedEventsInDb } = require('../update-events-in-db')
const {
  removeDetectedEventsFromState,
  removeOnChainRequestsFromState,
  removeProposalsEventsFromState,
} = require('../state/state-operations')
const constants = require('ptokens-constants')

const pollForRequestsErrorHandler = R.curry((_pollForRequestsLoop, _err) => Promise.reject(_err))

const maybeProcessNewRequestsAndPropose = _state =>
  logger.info('Polling for new requests EVM...') ||
  getOnChainQueuedRequestsAndPutInState(_state)
    .then(getDetectedEventsFromDbAndPutInState)
    .then(filterOutOnChainRequestsAndPutInState)
    .then(removeOnChainRequestsFromState)
    .then(maybeBuildProposalsTxsAndPutInState)
    .then(removeDetectedEventsFromState)
    .then(maybeUpdateProposedEventsInDb)
    .then(removeProposalsEventsFromState)
    .then(logic.sleepThenReturnArg(_state[constants.state.KEY_LOOP_SLEEP_TIME]))

const INFINITE_LOOP = {
  rounds: logic.LOOP_MODE.INFINITE,
}

const pollForRequestsAndProposeLoop = _state =>
  logic
    .loop(INFINITE_LOOP, maybeProcessNewRequestsAndPropose, [_state])
    .catch(pollForRequestsErrorHandler(pollForRequestsAndProposeLoop))

module.exports = {
  pollForRequestsAndProposeLoop,
  maybeProcessNewRequestsAndPropose,
}