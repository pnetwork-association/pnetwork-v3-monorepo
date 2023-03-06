const { checkType } = require('../validation')
const { isNotNil } = require('./utils-ramda-ext')
const { ERROR_KEY_NOT_FOUND, ERROR_UNABLE_TO_FIND_PATHS } = require('../errors')
const { has, path, isNil, prop, curry } = require('ramda')

const getKeyFromObj = curry(
  (_key, _object) =>
    new Promise((resolve, reject) =>
      has(_key, _object)
        ? resolve(prop(_key, _object))
        : reject(
            new Error(
              `${ERROR_KEY_NOT_FOUND} ('${_key}' not found in ${JSON.stringify(
                _object
              )})`
            )
          )
    )
)

const getKeyFromObjThroughPath = curry((_path, _object) =>
  checkType('Array', _path)
    .then(_ => checkType('Object', _object))
    .then(_ => path(_path, _object))
    .then(_value =>
      isNil(_value)
        ? Promise.reject(
            new Error(
              `${ERROR_KEY_NOT_FOUND} - Path '[${_path}]' not found in ${JSON.stringify(
                _object
              )}`
            )
          )
        : Promise.resolve(_value)
    )
)

const getKeyFromObjThroughPossiblePaths = curry((_paths, _object) =>
  Promise.all(_paths.map(_path => path(_path, _object)))
    .then(_possibleValues => _possibleValues.filter(isNotNil))
    .then(_filteredValues =>
      _filteredValues.length === 0
        ? Promise.reject(
            new Error(
              `${ERROR_UNABLE_TO_FIND_PATHS} ${JSON.stringify(_object)}`
            )
          )
        : _filteredValues[0]
    )
)

const parseJsonAsync = _jsonStr =>
  new Promise((resolve, reject) => {
    try {
      return resolve(JSON.parse(_jsonStr))
    } catch (err) {
      return reject(err)
    }
  })

const objectifySync = _json => JSON.parse(JSON.stringify(_json))

/**
 * Flip object's key/value pairs. The object can't have
 * nested fields.
 *
 * Example:
 *
 * {
 *   a: 1
 *   b: 2
 * }
 *
 * to
 *
 * {
 *   '1': 'a',
 *   '2': 'b'
 * }
 * @param  {object} _obj [object to flip]
 * @return {object}      [another object with the key/value mirrored]
 */
const flipObjectPropertiesSync = _obj =>
  Object.fromEntries(Object.entries(_obj).map(([key, value]) => [value, key]))

module.exports = {
  getKeyFromObj,
  objectifySync,
  parseJsonAsync,
  flipObjectPropertiesSync,
  getKeyFromObjThroughPath,
  getKeyFromObjThroughPossiblePaths,
}
