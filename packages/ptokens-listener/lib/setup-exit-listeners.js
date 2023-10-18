const config = require('../config')
const { db } = require('ptokens-utils')
const constants = require('ptokens-constants')
const { logger, shutDownLogging } = require('./get-logger')

const maybeCloseDbConnection = () =>
  db.closeConnection(config[constants.config.KEY_DB][constants.config.KEY_URL]).catch(() => {
    logger.info('No database connection to close')
  })

const exitCleanly = _exitCode =>
  logger.info('Clean exit...') ||
  maybeCloseDbConnection()
    .then(shutDownLogging)
    .then(_ => process.exit(_exitCode))

const setupExitEventListeners = () =>
  Promise.all(
    ['SIGINT', 'SIGTERM', 'unhandledRejection'].map(_signal => {
      process.on(_signal, () => {
        logger.info(`${_signal} caught! Exiting...`)
        return exitCleanly(0)
      })
    })
  ).then(_ => logger.debug('Exit listeners set!'))

module.exports = {
  exitCleanly,
  setupExitEventListeners,
}
