const constants = require('./constants')
const configDbSchema = require('./schema-config-db')

module.exports = {
  $async: true,
  type: 'object',
  required: [
    constants.SCHEMA_CHAIN_NAME_KEY,
    constants.SCHEMA_PROVIDER_URL_KEY,
    constants.SCHEMA_CHAIN_TYPE_KEY,
    constants.SCHEMA_NETWORK_ID_KEY,
    constants.SCHEMA_EVENTS_KEY,
    constants.SCHEMA_DB_KEY,
  ],
  properties: {
    [constants.SCHEMA_CHAIN_NAME_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_PROVIDER_URL_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_CHAIN_TYPE_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_NETWORK_ID_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_EVENTS_KEY]: {
      type: 'array',
      items: {
        type: 'object',
        required: [
          constants.SCHEMA_NAME_KEY,
          constants.SCHEMA_TOKEN_CONTRACTS_KEY,
        ],
        properties: {
          [constants.SCHEMA_NAME_KEY]: {
            type: 'string',
          },
          [constants.SCHEMA_TOKEN_CONTRACTS_KEY]: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    },
    [constants.SCHEMA_DB_KEY]: configDbSchema,
  },
}
