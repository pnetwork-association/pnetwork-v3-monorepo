const { not, isNil } = require('ramda')


const isNotNil = _something => not(isNil(_something))

module.exports = {
  isNotNil,
}