const constants = require('ptokens-constants')
const { db } = require('ptokens-utils')
const { logger, shutDownLogging } = require('./get-logger')

const exitCleanly = (_state, _exitCode) => {
  logger.info('Clean exit...')
  const dbUrl = _state[constants.config.KEY_DB][constants.config.KEY_URL]
  return db
    .closeConnection(dbUrl)
    .then(_ => shutDownLogging())
    .then(_ => process.exit(_exitCode))
}

const setupExitEventListeners = _state =>
  Promise.all(
    ['SIGINT', 'SIGTERM'].map(_signal => {
      process.on(_signal, () => {
        logger.info(`${_signal} caught! Exiting...`)
        return exitCleanly(_state, 0)
      })
    })
  ).then(_ => logger.debug('Exit listeners set!') || _state)

module.exports = {
  exitCleanly,
  setupExitEventListeners,
}
