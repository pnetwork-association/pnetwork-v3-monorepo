const { has, not, isNil, isEmpty, curry, includes, filter } = require('ramda')

const hasNot = _something => not(has(_something))

const isNotNil = _something => not(isNil(_something))

const isNotEmpty = _something => not(isEmpty(_something))

const removeNilsFromList = _list => filter(isNotNil, _list)

const doesNotInclude = curry((_something, _list) =>
  not(includes(_something, _list))
)

module.exports = {
  hasNot,
  isNotNil,
  isNotEmpty,
  doesNotInclude,
  removeNilsFromList,
}
