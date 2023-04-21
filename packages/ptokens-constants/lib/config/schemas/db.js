const {
  KEY_URL,
  KEY_NAME,
  KEY_TABLE_EVENTS
} = require('../constants')

module.exports = {
  type: 'object',
  required: [KEY_URL, KEY_NAME, KEY_TABLE_EVENTS],
  properties: {
    [KEY_NAME]: { type: 'string' },
    [KEY_URL]: { type: 'string' },
    [KEY_TABLE_EVENTS]: { type: 'string' },
  },
  additionalProperties: false,
}
