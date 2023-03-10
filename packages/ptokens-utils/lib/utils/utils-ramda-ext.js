const { has, not, isNil, isEmpty } = require('ramda')

const hasNot = _something => not(has(_something))

const isNotNil = _something => not(isNil(_something))

const isNotEmpty = _something => not(isEmpty(_something))

module.exports = {
  hasNot,
  isNotNil,
  isNotEmpty,
}
