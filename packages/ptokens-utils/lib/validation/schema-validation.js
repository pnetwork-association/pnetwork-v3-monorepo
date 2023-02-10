const Ajv = require('ajv')
const { curry } = require('ramda')
const { memoizeWith } = require('ramda')
const { ERROR_SCHEMA_VALIDATION_FAILED } = require('../errors')

const getValidationFunction = memoizeWith(JSON.stringify, _schema =>
  new Ajv().compile(_schema)
)

const validateJson = curry((_schema, _json) =>
  Promise.resolve(getValidationFunction(_schema))
    .then(_validate => _validate(_json))
    .then(_isValid => _isValid || Promise.reject(new Error(`${ERROR_SCHEMA_VALIDATION_FAILED}: ${JSON.stringify(_json)}`))
    )
)

module.exports = {
  getValidationFunction,
  validateJson
}