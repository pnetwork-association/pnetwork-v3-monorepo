class LoopError extends Error {
  constructor(_msg, _lastLoopState) {
    super(_msg)
    const { isNotNil } = require('../utils')
    this.lastLoopState =
      isNotNil(_lastLoopState) && _lastLoopState.length > 0
        ? _lastLoopState[0]
        : undefined
  }
}

module.exports = {
  LoopError,
}
