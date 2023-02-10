const log4js = require('@log4js-node/log4js-api')
const constants = require('../constants')

// TODO: validate _params object
const getDefaultConfiguration = _params => ({
  appenders: {
    stdout: {
      type: 'stdout',
      layout: constants.loggerFormats.STDOUT,
    },
    fileLog: {
      type: 'dateFile',
      numBackups: 30,
      compress: true,
      level: 'debug',
      filename: _params.logFileRelativePath || './logs/component.log',
      layout: constants.loggerFormats.LOG_FILE,
    },
    logLevelFilter: {
      type: 'logLevelFilter',
      level: _params.stdoutLevel || 'debug',
      appender: 'stdout',
    },
  },
  categories: {
    default: {
      appenders: ['fileLog', 'logLevelFilter'],
      level: 'all',
    },
  },
})

const logger = log4js.getLogger('ptokens-utils')

const shutDownLogging = () =>
  new Promise(resolve =>
    logger.info('Shutting down logging...') ||
    log4js.shutdown(resolve)
  )

module.exports = {
  logger,
  shutDownLogging,
  getDefaultConfiguration,
}
