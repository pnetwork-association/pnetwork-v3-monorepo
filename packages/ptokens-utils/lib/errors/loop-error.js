/**
 * Useful to throw errors when inside a loop and
 * get the state object included in the error.
 *
 * Usage:
 *
 *   loop(err.message, stateObject)
 *
 * or in a catch, in order to deliver the stacktrace
 *
 *   .catch(_err => new LoopError('Loop failed!', {}, _err))
 */
class LoopError extends Error {
  constructor(_msg, _lastLoopState, _err = null) {
    // cause delivers the stacktrace
    super(_msg, { cause: _err })
    const { isNotNil } = require('../utils')
    this.lastLoopState =
      isNotNil(_lastLoopState) && _lastLoopState.length > 0 ? _lastLoopState[0] : undefined
  }
}

module.exports = {
  LoopError,
}
