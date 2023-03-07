const Ajv = require('ajv')
const addFormats = require('ajv-formats')
const { curry } = require('ramda')
const { memoizeWith } = require('ramda')
const { ERROR_SCHEMA_VALIDATION_FAILED } = require('../errors')

const ajv = new Ajv()

addFormats(ajv)

const getValidationFunction = memoizeWith(JSON.stringify, _schema =>
  ajv.compile(_schema)
)

const validateJson = curry((_schema, _json) =>
  Promise.resolve(getValidationFunction(_schema))
    .then(_validate => _validate(_json))
    .then(
      _isValid =>
        _isValid ||
        Promise.reject(
          new Error(
            `${ERROR_SCHEMA_VALIDATION_FAILED}: ${JSON.stringify(_json)}`
          )
        )
    )
)

module.exports = {
  getValidationFunction,
  validateJson,
}
