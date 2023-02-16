const { logger } = require('../logger')
const { isNotNil } = require('../utils')
const { LoopError } = require('../errors')
const { validateJson } = require('../validation')

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

  // If rounds < 0 then "infinite loop"
  // otherwise "loop until rounds"
  let index = 0
  const shouldContinue = () =>
    _loopParams.rounds < 0
      ? logger.info('Perfoming another round... (infinite loop)') || true
      : logger.info(`Perfoming another round (index: ${index}`) ||
        ++index <= _loopParams.rounds

  let newArgs = _promiseFnArgs
  while (shouldContinue()) {
    try {
      newArgs = await _promiseFn(...newArgs)
      newArgs = [newArgs]
    } catch (e) {
      return Promise.reject(new LoopError(e, newArgs))
    }
  }

  if (isNotNil(newArgs) && newArgs.length > 0) {
    return Promise.resolve(newArgs[0])
  }

  return Promise.resolve(newArgs)
}

module.exports = {
  loop,
  LOOP_MODE,
}
