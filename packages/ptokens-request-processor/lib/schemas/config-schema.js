const { configDbSchema } = require('ptokens-schemas')

module.exports = {
  type: 'object',
  required: ['db'],
  properties: {
    db: configDbSchema,
  },
  additionalProperties: false,
}
