const { logger, shutDownLogging } = require('./get-logger')

const exitCleanly = _exitCode =>
  logger.info('Clean exit...') ||
  // eslint-disable-next-line no-process-exit
  shutDownLogging().then(_ => process.exit(_exitCode))

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
