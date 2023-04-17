const R = require('ramda')

const hasNot = _something => R.not(R.has(_something))

const isNotNil = _something => R.not(R.isNil(_something))

const isNotEmpty = _something => R.not(R.isEmpty(_something))

const removeNilsFromList = _list => R.filter(isNotNil, _list)

const doesNotInclude = R.curry((_something, _list) =>
  R.not(R.includes(_something, _list))
)

module.exports = {
  hasNot,
  isNotNil,
  isNotEmpty,
  doesNotInclude,
  removeNilsFromList,
}
