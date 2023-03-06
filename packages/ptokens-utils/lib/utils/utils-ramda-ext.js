const { not, isNil, isEmpty } = require('ramda')

const isNotNil = _something => not(isNil(_something))

const isNotEmpty = _something => not(isEmpty(_something))

module.exports = {
  isNotNil,
  isNotEmpty,
}
