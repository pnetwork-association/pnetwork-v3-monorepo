const { logger } = require('./get-logger')
const constants = require('ptokens-constants')
const { validation } = require('ptokens-utils')

const validateConfiguration = _config =>
  validation.validateJson(constants.config.schemas.listener, _config).then(() => _config)

module.exports.checkConfiguration = _config =>
  validateConfiguration(_config)
    .then(_config => logger.info('Valid configuration file detected') || _config)
    .catch(
      _err =>
        logger.error(`Failed to parse the configuration - ${_err.message}`) || Promise.reject(_err)
    )
