const { curry } = require('ramda')
const { logic } = require('ptokens-utils')
const { logger } = require('./get-logger')

// TODO: configurable
const SLEEP_TIME = 1000

const getFinalTxsFromDbAndPutInState = _state => {
  logger.info('getFinalTxsFromDbAndPutInState')
  return Promise.resolve(_state)
}
const buildFinalTxsAndPutInState = _state => {
  logger.info('buildFinalTxsAndPutInState')
  return Promise.resolve(_state)
}
const broadcastTxsAndPutResultInState = _state => {
  logger.info('broadcastTxsAndPutResultInState')
  return Promise.resolve(_state)
}

const processFinalTransactions = _state =>
  logger.info('processFinalTransactions') ||
  getFinalTxsFromDbAndPutInState(_state)
    .then(buildFinalTxsAndPutInState)
    .then(broadcastTxsAndPutResultInState)
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
