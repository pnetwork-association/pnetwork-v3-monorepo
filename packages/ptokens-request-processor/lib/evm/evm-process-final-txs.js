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
const {
  removeProposalsEventsFromState,
  removeFinalizedEventsFromState,
} = require('../state/state-operations')
const constants = require('ptokens-constants')
const { maybeUpdateFinalizedEventsInDb } = require('../update-events-in-db')

const maybeProcessFinalTransactions = _state =>
  logger.info('Maybe processing final transactions on EVM chain...') ||
  getProposedEventsFromDbAndPutInState(_state)
    .then(maybefilterForExpiredProposalsAndPutThemInState)
    .then(maybeBuildFinalTxsAndPutInState)
    .then(removeProposalsEventsFromState)
    .then(maybeUpdateFinalizedEventsInDb)
    .then(removeFinalizedEventsFromState)
    .then(
      logic.sleepThenReturnArg(
        _state[constants.state.STATE_KEY_LOOP_SLEEP_TIME]
      )
    )

const processFinalTxsErrorHandler = curry((_state, _err) => {
  logger.error('Final transactions error handler...')
  return Promise.reject(_err)
})

const INFINITE_LOOP = {
  rounds: logic.LOOP_MODE.INFINITE,
}

const processFinalTransactionsLoop = _state =>
  logic
    .loop(INFINITE_LOOP, maybeProcessFinalTransactions, [_state])
    .catch(processFinalTxsErrorHandler(processFinalTransactionsLoop))

module.exports = {
  maybeProcessFinalTransactions,
  processFinalTransactionsLoop,
}
