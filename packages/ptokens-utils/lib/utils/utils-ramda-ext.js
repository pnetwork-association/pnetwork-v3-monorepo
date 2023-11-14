const R = require('ramda')

const hasNot = _something => R.not(R.has(_something))

const isNotNil = _something => R.not(R.isNil(_something))

const isNotEmpty = _something => R.not(R.isEmpty(_something))

const isNotEqual = R.curry((_this, _that) => R.not(R.equals(_this, _that)))

const removeNilsFromList = _list => R.filter(isNotNil, _list)

const doesNotInclude = R.curry((_something, _list) => R.not(R.includes(_something, _list)))

const sortKeysAlphabetically = obj => {
  if (R.type(obj) !== 'Object' || obj === null) {
    return obj
  }

  const sortedKeys = Object.keys(obj).sort()
  const sortedObj = {}

  for (const key of sortedKeys) {
    sortedObj[key] = sortKeysAlphabetically(obj[key])
  }

  return sortedObj
}

const rejectIfNotEqual = R.curry((_errMsg, _this, _that) =>
  isNotEqual(_this, _that) ? Promise.reject(new Error(_errMsg)) : Promise.resolve()
)

const createErrorFromAnything = _anything => {
  switch (R.type(_anything)) {
    case 'Error':
      return _anything
    case 'String':
      return new Error(_anything)
    default:
      return new Error(JSON.stringify(_anything))
  }
}

const rejectIfNil = R.curry((_err, _thing) =>
  R.isNil(_thing) ? Promise.reject(createErrorFromAnything(_err)) : Promise.resolve(_thing)
)

module.exports = {
  hasNot,
  isNotNil,
  isNotEqual,
  isNotEmpty,
  rejectIfNil,
  doesNotInclude,
  rejectIfNotEqual,
  removeNilsFromList,
  sortKeysAlphabetically,
}
