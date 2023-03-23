const { curry } = require('ramda')
const { logic } = require('ptokens-utils')
const { logger } = require('../get-logger')
const { maybeBuildFinalTxsAndPutInState } = require('./evm-build-final-txs')
const {
  getProposedEventsFromDbAndPutInState,
} = require('../get-events-from-db')
const {
  maybefilterForExpiredProposalsAndPutThemInState,
} = require('./evm-filter-for-expired-challenge-period')
const { removeProposalsEventsFromState } = require('../state/state-operations')
const { maybeUpdateFinalizedEventsInDb } = require('../update-events-in-db')

// TODO: configurable
const SLEEP_TIME = 1000

const processFinalTransactions = _state =>
  logger.info('processFinalTransactions EVM') ||
  getProposedEventsFromDbAndPutInState(_state)
    .then(maybefilterForExpiredProposalsAndPutThemInState)
    .then(maybeBuildFinalTxsAndPutInState)
    .then(maybeUpdateFinalizedEventsInDb)
    .then(removeProposalsEventsFromState)
    .then(logic.sleepThenReturnArg(SLEEP_TIME))

const processFinalRequestsErrorHandler = curry((_state, _err) => {
  logger.error('Final transactions error handler...')
  return Promise.reject(_err)
})

const INFINITE_LOOP = {
  rounds: logic.LOOP_MODE.INFINITE,
}

const maybeProcessFinalTransactions = _state =>
  logic
    .loop(INFINITE_LOOP, processFinalTransactions, [_state])
    .catch(processFinalRequestsErrorHandler(maybeProcessFinalTransactions))

module.exports = {
  maybeProcessFinalTransactions,
}
