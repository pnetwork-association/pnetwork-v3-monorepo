const { configListenerSchema } = require('ptokens-schemas')
const { validation } = require('ptokens-utils')
const { logger } = require('./get-logger')

const validateConfiguration = _config =>
  validation.validateJson(configListenerSchema, _config).then(() => _config)

module.exports.checkConfiguration = _config =>
  validateConfiguration(_config)
    .then(
      _config => logger.info('Valid configuration file detected') || _config
    )
    .catch(
      _err =>
        logger.error(`Failed to parse the configuration - ${_err.message}`) ||
        Promise.reject(_err)
    )
