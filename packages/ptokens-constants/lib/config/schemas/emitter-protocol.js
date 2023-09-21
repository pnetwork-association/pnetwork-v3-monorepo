const { KEY_TYPE, KEY_DATA } = require('../constants')

module.exports = {
  type: 'object',
  required: [KEY_TYPE, KEY_DATA],
  properties: {
    [KEY_TYPE]: {
      type: 'string',
    },
    [KEY_DATA]: {
      type: 'object',
    },
  },
}
