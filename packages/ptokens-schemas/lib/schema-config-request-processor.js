const constants = require('./constants')
const configDbSchema = require('./schema-config-db')

module.exports = {
  $async: true,
  type: 'object',
  required: [
    constants.SCHEMA_DB_KEY,
    constants.SCHEMA_CHAIN_ID_KEY,
    constants.SCHEMA_CHAIN_NAME_KEY,
    constants.SCHEMA_CHAIN_TYPE_KEY,
    constants.SCHEMA_CHALLENGE_PERIOD,
    constants.SCHEMA_PROVIDER_URL_KEY,
    constants.SCHEMA_STATE_MANAGER_KEY,
    constants.SCHEMA_IDENTITY_GPG_KEY,
  ],
  properties: {
    [constants.SCHEMA_TX_TIMEOUT]: {
      type: 'integer',
    },
    [constants.SCHEMA_DB_KEY]: configDbSchema,
    [constants.SCHEMA_CHAIN_ID_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_CHAIN_NAME_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_CHAIN_TYPE_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_PROVIDER_URL_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_STATE_MANAGER_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_IDENTITY_GPG_KEY]: {
      type: 'string',
    },
  },
}
