const { logger, shutDownLogging } = require('./get-logger')

const exitCleanly = _exitCode =>
  logger.info('Clean exit...') ||
  // eslint-disable-next-line no-process-exit
  shutDownLogging().then(_ => process.exit(_exitCode))

const setupExitEventListeners = () => {
  ;['SIGINT', 'SIGTERM'].map(_signal => {
    process.on(_signal, () => {
      logger.info(`${_signal} caught! Exiting...`)
      return exitCleanly(0)
    })
  })

  logger.debug('Exit listeners set!')

  return Promise.resolve()
}

module.exports = {
  exitCleanly,
  setupExitEventListeners,
}
