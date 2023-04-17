const { logger, shutDownLogging } = require('./get-logger')
const { db } = require('ptokens-utils')
const config = require('../config')
const schemas = require('ptokens-schemas')

const maybeCloseDbConnection = () =>
  db
    .closeConnection(
      config[schemas.constants.SCHEMA_DB_KEY][schemas.constants.SCHEMA_URL_KEY]
    )
    .catch(() => {
      logger.info('No database connection to close')
    })

const exitCleanly = _exitCode =>
  logger.info('Clean exit...') ||
  maybeCloseDbConnection()
    .then(shutDownLogging)
    // eslint-disable-next-line no-process-exit
    .then(_ => process.exit(_exitCode))

const setupExitEventListeners = () =>
  Promise.all(
    ['SIGINT', 'SIGTERM'].map(_signal => {
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
