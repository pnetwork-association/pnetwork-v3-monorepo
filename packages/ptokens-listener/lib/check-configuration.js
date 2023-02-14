const { getConfiguration } = require('./configuration')
const configurationSchema = require('./schemas/listener-configuration')
const { validation } = require('ptokens-utils')
const { logger } = require('./get-logger')

const validSchemas = [configurationSchema]

const validateConfiguration = _config =>
  Promise.any(
    validSchemas.map(_schema => validation.validateJson(_schema, _config))
  ).then(() => _config)

module.exports.checkConfiguration = () =>
  Promise.resolve(getConfiguration())
    .then(validateConfiguration)
    .then(
      _config => logger.info('Valid configuration file detected') || _config
    )
    .catch(
      _err =>
        logger.error(`Failed to parse the configuration - ${_err.message}`) ||
        Promise.reject(_err)
    )
