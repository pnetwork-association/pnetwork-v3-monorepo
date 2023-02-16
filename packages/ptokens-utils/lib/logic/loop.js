const { logger } = require('../logger')
const { isNotNil } = require('../utils')
const { LoopError } = require('../errors')
const { ERROR_UNKNOWN_RETURN } = require('../errors')
const { validateJson, checkType } = require('../validation')

const LOOP_MODE = {
  INFINITE: -1,
}

const loopSchema = {
  type: 'object',
  required: ['rounds'],
  properties: {
    rounds: { type: 'integer' },
  },
  additionalProperties: false,
}

/**
 * Async loop of a function
 * @param  {Object} _loopParams              [Parameters object]
 * @param  {Function} _promiseFn             [Async function to loop]
 * @param  {Array}  _promiseFnArgs          [Async function arguments array]
 * @return {Object}                          [The final object where the _promiseFn ]
 *
 * _loopParams follows the following schema:
 *
 * {
 *   "rounds": <number-of-iterations>,
 * }
 *
 * If rounds is negative, then an infinite loop is performed.
 */
const loop = async (_loopParams, _promiseFn, _promiseFnArgs = []) => {
  await validateJson(loopSchema, _loopParams)
  await checkType('Array', _promiseFnArgs)

  // If rounds < 0 then "infinite loop"
  // otherwise "loop until rounds"
  let index = 0
  const shouldContinue = () => {
    if (_loopParams.rounds < 0) {
      logger.info('Perfoming another round... (infinite loop)')
      return true
    } else {
      index += 1
      const condition = index <= _loopParams.rounds
      const logPrefix = `${condition ? 'P' : 'Not p'}`
      logger.info(`${logPrefix}erforming another round (index: ${index})`)
      return condition
    }
  }

  let newArgs = _promiseFnArgs
  while (shouldContinue()) {
    try {
      newArgs = [await _promiseFn(...newArgs)]
    } catch (e) {
      return Promise.reject(new LoopError(e, newArgs))
    }
  }

  // It is expected the args have been
  // wrapped into an array of one single
  // element, either inside the loop (line 58)
  // or upon function call (line 35)
  if (isNotNil(newArgs) && newArgs.length > 0) {
    return Promise.resolve(newArgs[0])
  }

  // Should never hit here
  return Promise.reject(new LoopError(ERROR_UNKNOWN_RETURN, newArgs))
}

module.exports = {
  loop,
  LOOP_MODE,
}
