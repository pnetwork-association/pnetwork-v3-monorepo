const {
  KEY_LATEST_BLOCK_HASH,
  KEY_LATEST_BLOCK_NUMBER,
  KEY_LATEST_BLOCK_TS,
} = require('../constants')

module.exports = {
  type: 'object',
  properties: {},
  additionalProperties: {
    type: 'object',
    properties: {
      [KEY_LATEST_BLOCK_HASH]: { type: 'string' },
      [KEY_LATEST_BLOCK_NUMBER]: { type: 'integer' },
      [KEY_LATEST_BLOCK_TS]: { type: 'integer' },
    },
    additionalProperties: false,
  },
}
