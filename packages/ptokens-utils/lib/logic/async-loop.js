const { curry } = require('ramda')
const { logger } = require('../logger')
const { checkType } = require('../validation')

const ARGS_KEY = 'args'
const RESULT_KEY = 'result'
const ERROR_REITERATE = 'trampoline'
const ERROR_STOP_LOOP = 'stop loop'

const reiterate = _newArgs => {
  const error = new Error(ERROR_REITERATE)
  error[ARGS_KEY] = _newArgs

  return Promise.reject(error)
}

const stopLoop = _returnValue => {
  const error = new Error(ERROR_STOP_LOOP)
  error[RESULT_KEY] = _returnValue

  return Promise.reject(error)
}

// We expect `_function` to return the new
// args to be submitted in the next call.
// Check into the relative tests how this is done.
//
// Infinite loops can be achieved by not calling the
// `stopLoop` function ever.
const asyncLoop = curry((_function, _args = []) =>
  checkType('Array', _args)
    .then(_ => checkType('Function', _function))
    .then(_ => {
      const loop = args =>
        _function(...args)
          .then(reiterate)
          .catch(_err => {
            if (_err.message === ERROR_REITERATE) {
              logger.trace('async-loop: reiterating...', _err[ARGS_KEY])
              return loop(_err[ARGS_KEY])
            } else if (_err.message === ERROR_STOP_LOOP) {
              logger.trace('async-loop: stopping w/ result', _err[RESULT_KEY])
              return Promise.resolve(_err[RESULT_KEY])
            } else {
              logger.trace('async-loop: rejecting...')
              return Promise.reject(_err)
            }
          })

      return loop(_args)
    })
)

module.exports = {
  stopLoop,
  asyncLoop,
}