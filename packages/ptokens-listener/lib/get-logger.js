const log4js = require('log4js')
const pTokensUtils = require('ptokens-utils')
const schemas = require('ptokens-schemas')
const config = require('../config')

const loggingParams = {
  stdoutLevel: 'debug',
  logFileRelativePath: `./logs/listener-${
    config[schemas.constants.configurationFields.SCHEMA_NETWORK_ID_KEY]
  }.log`,
}

// Important: ptokens-utils logs are not shown when the
// library is npm installed locally (this happens when
// using the Dockerfile.dev)
log4js.configure(pTokensUtils.logger.getDefaultConfiguration(loggingParams))

const logger = log4js.getLogger('relayer')

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
