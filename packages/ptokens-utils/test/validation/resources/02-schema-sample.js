module.exports = {
  type: 'object',
  properties: {
    sleepTime: {
      type: 'integer',
    },
    maxAttempts: {
      type: 'integer',
    },
    successMessage: {
      type: 'string',
    },
  },
  required: ['maxAttempts', 'sleepTime', 'successMessage'],
  additionalProperties: false,
}
