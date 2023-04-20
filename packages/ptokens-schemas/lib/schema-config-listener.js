const { configurationFields } = require('./constants')
const configDbSchema = require('./schema-config-db')

module.exports = {
  $async: true,
  type: 'object',
  required: [
    configurationFields.SCHEMA_CHAIN_NAME_KEY,
    configurationFields.SCHEMA_PROVIDER_URL_KEY,
    configurationFields.SCHEMA_CHAIN_TYPE_KEY,
    configurationFields.SCHEMA_NETWORK_ID_KEY,
    configurationFields.SCHEMA_EVENTS_KEY,
    configurationFields.SCHEMA_DB_KEY,
  ],
  properties: {
    [configurationFields.SCHEMA_CHAIN_NAME_KEY]: {
      type: 'string',
    },
    [configurationFields.SCHEMA_PROVIDER_URL_KEY]: {
      type: 'string',
    },
    [configurationFields.SCHEMA_CHAIN_TYPE_KEY]: {
      type: 'string',
    },
    [configurationFields.SCHEMA_NETWORK_ID_KEY]: {
      type: 'string',
    },
    [configurationFields.SCHEMA_EVENTS_KEY]: {
      type: 'array',
      items: {
        type: 'object',
        required: [
          configurationFields.SCHEMA_NAME_KEY,
          configurationFields.SCHEMA_CONTRACTS_KEY,
        ],
        properties: {
          [configurationFields.SCHEMA_NAME_KEY]: {
            type: 'string',
          },
          [configurationFields.SCHEMA_CONTRACTS_KEY]: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    },
    [configurationFields.SCHEMA_DB_KEY]: configDbSchema,
  },
}
