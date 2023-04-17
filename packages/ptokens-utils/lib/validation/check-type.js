const R = require('ramda')
const { ERROR_INVALID_TYPE } = require('../errors')

module.exports.checkType = R.curry((_valueType, _value) =>
  R.type(_value) === _valueType
    ? Promise.resolve(_value)
    : Promise.reject(
        new Error(
          `${ERROR_INVALID_TYPE}: expected '${_valueType}' for ${_value}`
        )
      )
)
