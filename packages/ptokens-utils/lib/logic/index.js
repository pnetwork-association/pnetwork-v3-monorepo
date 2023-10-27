const enums = require('./enums')
const logic = require('./logic')
const loop = require('./loop')
const mapAll = require('./map-all')

module.exports = {
  enums,
  ...logic,
  ...loop,
  ...mapAll,
}
