const enums = require('./enums')
const logic = require('./logic')
const loop = require('./loop')

module.exports = {
  enums,
  ...logic,
  ...loop,
}
