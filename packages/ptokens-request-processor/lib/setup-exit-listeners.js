const { logger, shutDownLogging } = require('./get-logger')

const exitCleanly = _exitCode =>
  logger.info('Clean exit...') || shutDownLogging().then(_ => process.exit(_exitCode))

const setupExitEventListeners = () => {
  ;['SIGINT', 'SIGTERM', 'unhandledRejection'].map(_signal => {
    process.on(_signal, () => {
      logger.info(`${_signal} caught! Exiting...`)
      return exitCleanly(0)
    })
  })

  logger.debug('Exit listeners set!')

  return Promise.resolve()
}

module.exports = {
  setupExitEventListeners,
}
