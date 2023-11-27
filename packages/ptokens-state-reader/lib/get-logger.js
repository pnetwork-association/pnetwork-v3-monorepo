const log4js = require('log4js')
const pTokensUtils = require('ptokens-utils')

const loggingParams = {
  stdoutLevel: 'debug',
  logFileRelativePath: './logs/state-reader.log',
}

// Important: ptokens-utils logs are not shown when the
// library is npm installed locally (this happens when
// using the Dockerfile.dev)
log4js.configure(pTokensUtils.logger.getDefaultConfiguration(loggingParams))

const logger = log4js.getLogger('state-reader')

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
