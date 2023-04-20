const { configurationFields } = require('./constants')

module.exports = {
  type: 'object',
  required: [
    configurationFields.SCHEMA_NAME_KEY,
    configurationFields.SCHEMA_URL_KEY,
    configurationFields.SCHEMA_TABLE_EVENTS_KEY,
  ],
  properties: {
    [configurationFields.SCHEMA_NAME_KEY]: { type: 'string' },
    [configurationFields.SCHEMA_URL_KEY]: { type: 'string' },
    [configurationFields.SCHEMA_TABLE_EVENTS_KEY]: { type: 'string' },
  },
  additionalProperties: false,
}
