const log4js = require('log4js')
const config = require('../config')
const pTokensUtils = require('ptokens-utils')
const constants = require('ptokens-constants')

const loggingParams = {
  stdoutLevel: 'debug',
  logFileRelativePath: `./logs/${config[constants.config.KEY_CHAIN_NAME]}-processor.log`,
}

log4js.configure(pTokensUtils.logger.getDefaultConfiguration(loggingParams))

const logger = log4js.getLogger('webserver')

const logAggregatedErrorSync = _aggregateError => {
  const errors = _aggregateError.errors || []
  errors.map(_err => logger.error(_err))
}

const shutDownLogging = () =>
  new Promise(resolve => logger.info('Shutting down logging...') || log4js.shutdown(resolve))

module.exports = {
  logger,
  shutDownLogging,
  logAggregatedErrorSync,
}
