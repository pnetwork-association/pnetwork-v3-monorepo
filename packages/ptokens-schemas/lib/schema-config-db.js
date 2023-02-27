module.exports = {
  type: 'object',
  required: ['name', 'url', 'table-events'],
  properties: {
    name: { type: 'string' },
    url: { type: 'string' },
    'table-events': { type: 'string' },
  },
  additionalProperties: false,
}
