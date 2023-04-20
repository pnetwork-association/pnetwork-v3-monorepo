const { configurationFields } = require('./constants')
const configDbSchema = require('./schema-config-db')

module.exports = {
  $async: true,
  type: 'object',
  required: [
    configurationFields.SCHEMA_DB_KEY,
    configurationFields.SCHEMA_NETWORK_ID_KEY,
    configurationFields.SCHEMA_CHAIN_NAME_KEY,
    configurationFields.SCHEMA_CHAIN_TYPE_KEY,
    configurationFields.SCHEMA_CHALLENGE_PERIOD,
    configurationFields.SCHEMA_PROVIDER_URL_KEY,
    configurationFields.SCHEMA_STATE_MANAGER_KEY,
    configurationFields.SCHEMA_IDENTITY_GPG_KEY,
  ],
  properties: {
    [configurationFields.SCHEMA_TX_TIMEOUT]: {
      type: 'integer',
    },
    [configurationFields.SCHEMA_DB_KEY]: configDbSchema,
    [configurationFields.SCHEMA_NETWORK_ID_KEY]: {
      type: 'string',
    },
    [configurationFields.SCHEMA_CHAIN_NAME_KEY]: {
      type: 'string',
    },
    [configurationFields.SCHEMA_CHAIN_TYPE_KEY]: {
      type: 'string',
    },
    [configurationFields.SCHEMA_PROVIDER_URL_KEY]: {
      type: 'string',
    },
    [configurationFields.SCHEMA_STATE_MANAGER_KEY]: {
      type: 'string',
    },
    [configurationFields.SCHEMA_IDENTITY_GPG_KEY]: {
      type: 'string',
    },
  },
}
