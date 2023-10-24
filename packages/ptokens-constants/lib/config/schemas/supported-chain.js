const {
  KEY_CHAIN_TYPE,
  KEY_CHAIN_NAME,
  KEY_NETWORK_ID,
  KEY_HUB_ADDRESS,
  KEY_PROVIDER_URL,
  KEY_GOVERNANCE_MESSAGE_EMITTER_ADDRESS,
} = require('../constants')

module.exports = {
  type: 'object',
  required: [KEY_CHAIN_TYPE, KEY_CHAIN_NAME, KEY_NETWORK_ID, KEY_PROVIDER_URL],
  properties: {
    [KEY_CHAIN_TYPE]: {
      type: 'string',
    },
    [KEY_CHAIN_NAME]: {
      type: 'string',
    },
    [KEY_NETWORK_ID]: {
      type: 'string',
    },
    [KEY_PROVIDER_URL]: {
      type: 'string',
    },
    [KEY_GOVERNANCE_MESSAGE_EMITTER_ADDRESS]: {
      type: ['string', 'null'],
    },
    [KEY_HUB_ADDRESS]: {
      type: ['string', 'null'],
    },
  },
}
