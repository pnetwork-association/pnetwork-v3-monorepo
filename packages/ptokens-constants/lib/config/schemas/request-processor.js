const {
  KEY_DB,
  KEY_NETWORK_ID,
  KEY_CHAIN_NAME,
  KEY_CHAIN_TYPE,
  KEY_TX_TIMEOUT,
  KEY_PROVIDER_URL,
  KEY_IDENTITY_GPG,
  KEY_STATE_MANAGER,
  KEY_CHALLENGE_PERIOD,
} = require('../constants')
const dbSchema = require('./db')

module.exports = {
  $async: true,
  type: 'object',
  required: [
    KEY_DB,
    KEY_NETWORK_ID,
    KEY_CHAIN_NAME,
    KEY_CHAIN_TYPE,
    KEY_CHALLENGE_PERIOD,
    KEY_PROVIDER_URL,
    KEY_STATE_MANAGER,
    KEY_IDENTITY_GPG,
  ],
  properties: {
    [KEY_TX_TIMEOUT]: {
      type: 'integer',
    },
    [KEY_DB]: dbSchema,
    [KEY_NETWORK_ID]: {
      type: 'string',
    },
    [KEY_CHAIN_NAME]: {
      type: 'string',
    },
    [KEY_CHAIN_TYPE]: {
      type: 'string',
    },
    [KEY_PROVIDER_URL]: {
      type: 'string',
    },
    [KEY_STATE_MANAGER]: {
      type: 'string',
    },
    [KEY_IDENTITY_GPG]: {
      type: 'string',
    },
  },
}
