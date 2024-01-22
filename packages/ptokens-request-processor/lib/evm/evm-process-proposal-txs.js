const R = require('ramda')
const { logic } = require('ptokens-utils')
const { logger } = require('../get-logger')
const { getDetectedEventsFromDbAndPutInState } = require('../get-events-from-db')
const { maybeBuildProposalsTxsAndPutInState } = require('./evm-build-proposals-txs')
const {
  filterOutDetectedEventsWithWrongStatusAndPutInState,
} = require('./evm-filter-out-onchain-requests')
const { maybeUpdateProposedEventsInDb } = require('../update-events-in-db')
const {
  removeDetectedEventsFromState,
  removeProposalsEventsFromState,
} = require('../state/state-operations')
const constants = require('ptokens-constants')
const evmCheckBalance = require('./evm-check-balance')

const pollForRequestsErrorHandler = R.curry((_pollForRequestsLoop, _err) => Promise.reject(_err))

const maybeProcessNewRequestsAndPropose = _state =>
  logger.info('Polling for new requests EVM...') ||
  evmCheckBalance
    .checkBalance(_state)
    .then(getDetectedEventsFromDbAndPutInState)
    .then(filterOutDetectedEventsWithWrongStatusAndPutInState)
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
