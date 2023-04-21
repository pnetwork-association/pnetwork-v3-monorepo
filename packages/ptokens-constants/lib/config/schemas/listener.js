const {
  KEY_DB,
  KEY_NAME,
  KEY_EVENTS,
  KEY_CONTRACTS,
  KEY_CHAIN_NAME,
  KEY_CHAIN_TYPE,
  KEY_NETWORK_ID,
  KEY_PROVIDER_URL,
} = require('../constants')
const configDbSchema = require('./db')

module.exports = {
  $async: true,
  type: 'object',
  required: [KEY_DB, KEY_EVENTS, KEY_CHAIN_TYPE, KEY_CHAIN_NAME, KEY_NETWORK_ID, KEY_PROVIDER_URL],
  properties: {
    [KEY_CHAIN_NAME]: {
      type: 'string',
    },
    [KEY_PROVIDER_URL]: {
      type: 'string',
    },
    [KEY_CHAIN_TYPE]: {
      type: 'string',
    },
    [KEY_NETWORK_ID]: {
      type: 'string',
    },
    [KEY_EVENTS]: {
      type: 'array',
      items: {
        type: 'object',
        required: [KEY_NAME, KEY_CONTRACTS],
        properties: {
          [KEY_NAME]: {
            type: 'string',
          },
          [KEY_CONTRACTS]: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    },
    [KEY_DB]: configDbSchema,
  },
}
