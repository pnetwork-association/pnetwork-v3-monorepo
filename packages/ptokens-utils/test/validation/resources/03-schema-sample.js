module.exports = {
  $async: true,
  type: 'object',
  required: ['a', 'b', 'c'],
  properties: {
    a: { type: 'string' },
    b: { type: 'string' },
    c: { type: ['integer'] },
  },
}
