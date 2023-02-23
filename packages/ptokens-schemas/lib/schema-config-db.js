const constants = require('./constants')

module.exports = {
  type: 'object',
  required: [
    constants.SCHEMA_NAME_KEY,
    constants.SCHEMA_URL_KEY,
    constants.SCHEMA_TABLE_EVENTS_KEY,
  ],
  properties: {
    [constants.SCHEMA_NAME_KEY]: { type: 'string' },
    [constants.SCHEMA_URL_KEY]: { type: 'string' },
    [constants.SCHEMA_TABLE_EVENTS_KEY]: { type: 'string' },
  },
  additionalProperties: false,
}
