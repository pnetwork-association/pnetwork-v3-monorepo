const {
  KEY_DB,
  KEY_SIGNATURES,
  KEY_EVENTS,
  KEY_CONTRACT,
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
        required: [KEY_SIGNATURES, KEY_CONTRACT],
        properties: {
          [KEY_CONTRACT]: {
            type: 'string',
          },
          [KEY_SIGNATURES]: {
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
