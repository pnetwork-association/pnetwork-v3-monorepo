const { KEY_PROTOCOLS, KEY_IDENTITY_GPG, KEY_SUPPORTED_CHAINS } = require('../constants')

const supportedChain = require('./supported-chain')
const emitterProtocol = require('./emitter-protocol')

module.exports = {
  $async: true,
  type: 'object',
  required: [KEY_PROTOCOLS, KEY_IDENTITY_GPG, KEY_SUPPORTED_CHAINS],
  properties: {
    [KEY_IDENTITY_GPG]: {
      type: 'string',
    },
    [KEY_PROTOCOLS]: {
      type: 'array',
      items: [emitterProtocol],
      minItems: 1,
    },
    [KEY_SUPPORTED_CHAINS]: {
      type: 'array',
      items: [supportedChain],
      minItems: 1,
    },
  },
}
