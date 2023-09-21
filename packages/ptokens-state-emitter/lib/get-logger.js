const log4js = require('log4js')
const pTokensUtils = require('ptokens-utils')
const constants = require('ptokens-constants')
const config = require('../config')

const loggingParams = {
  stdoutLevel: 'debug',
  logFileRelativePath: `./logs/${config[constants.config.KEY_CHAIN_NAME]}-state-emitter.log`,
}

// Important: ptokens-utils logs are not shown when the
// library is npm installed locally (this happens when
// using the Dockerfile.dev)
log4js.configure(pTokensUtils.logger.getDefaultConfiguration(loggingParams))

const logger = log4js.getLogger('state-emitter')

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
