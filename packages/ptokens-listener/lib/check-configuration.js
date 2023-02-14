const Ajv = require('ajv')
const { getConfiguration } = require('./configuration')
const schema = require('./schemas/listener-configuration')

const { logger } = require('./get-logger')

const validSchemas = [schema]

const validators = validSchemas.map(_el => new Ajv().compile(_el))

module.exports.checkConfiguration = () =>
  Promise.any(validators.map(_validator => _validator(getConfiguration())))
    .then(
      _config => logger.info('Valid configuration file detected') || _config
    )
    .catch(
      _err =>
        logger.error(`Failed to parse the configuration - ${_err.message}`) ||
        Promise.reject(_err)
    )
