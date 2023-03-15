const { curry } = require('ramda')
const { logic } = require('ptokens-utils')
const { logger } = require('../get-logger')
const { maybeBuildFinalTxsAndPutInState } = require('./evm-build-final-txs')
const {
  getProposedEventsFromDbAndPutInState,
} = require('../get-proposed-events-from-db')
const {
  filterForExpiredChallengePeriodAndPutInState,
} = require('./evm-filter-for-expired-challenge-period')

// TODO: configurable
const SLEEP_TIME = 1000

const processFinalTransactions = _state =>
  logger.info('processFinalTransactions EVM') ||
  getProposedEventsFromDbAndPutInState(_state)
    .then(filterForExpiredChallengePeriodAndPutInState)
    .then(maybeBuildFinalTxsAndPutInState)
    // .then(maybeUpdateReportsInDb)
    .then(logic.sleepThenReturnArg(SLEEP_TIME))

const processFinalRequestsErrorHandler = curry((_state, _err) => {
  logger.error(_err)
  return Promise.reject(new Error('Not implemented!'))
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
