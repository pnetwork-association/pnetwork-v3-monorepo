const Ajv = require('ajv')
const addFormats = require('ajv-formats')
const { logger } = require('../logger')
const { curry, memoizeWith } = require('ramda')
const { ERROR_SCHEMA_VALIDATION_FAILED } = require('../errors')

// Keep it global for efficiency reasons
// https://ajv.js.org/guide/managing-schemas.html#compiling-during-initialization
const ajv = new Ajv()
addFormats(ajv)

const getValidationFunction = memoizeWith(JSON.stringify, _schema =>
  ajv.compile(_schema)
)

const validateJson = curry(
  (_schema, _json) =>
    new Promise((resolve, reject) => {
      const validate = getValidationFunction(_schema)
      return validate(_json)
        ? resolve(_json)
        : logger.error(validate.errors) ||
            reject(new Error(ERROR_SCHEMA_VALIDATION_FAILED))
    })
)

module.exports = {
  getValidationFunction,
  validateJson,
}
