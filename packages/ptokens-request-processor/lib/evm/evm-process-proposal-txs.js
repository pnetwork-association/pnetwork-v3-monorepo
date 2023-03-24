const { curry } = require('ramda')
const { logic } = require('ptokens-utils')
const { logger } = require('../get-logger')
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
  filterOutOnChainRequestsAndPutInState,
} = require('./evm-filter-out-onchain-requests')
const { maybeUpdateProposedEventsInDb } = require('../update-events-in-db')
const {
  removeDetectedEventsFromState,
  removeOnChainRequestsFromState,
  removeProposalsEventsFromState,
} = require('../state/state-operations')

// TODO: configurable
const SLEEP_TIME = 1000

const pollForRequestsErrorHandler = curry((_pollForRequestsLoop, _err) => {
  return Promise.reject(_err)
})

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
    .then(logic.sleepThenReturnArg(SLEEP_TIME))

const INFINITE_LOOP = {
  rounds: logic.LOOP_MODE.INFINITE,
}

const pollForRequestsAndPropose = _state =>
  logic
    .loop(INFINITE_LOOP, maybeProcessNewRequestsAndPropose, [_state])
    .catch(pollForRequestsErrorHandler(pollForRequestsAndPropose))

module.exports = {
  pollForRequestsAndPropose,
  maybeProcessNewRequestsAndPropose,
}
