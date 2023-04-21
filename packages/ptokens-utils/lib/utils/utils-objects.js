const { checkType } = require('../validation')
const { isNotNil } = require('./utils-ramda-ext')
const { ERROR_KEY_NOT_FOUND, ERROR_UNABLE_TO_FIND_PATHS } = require('../errors')
const R = require('ramda')

const getKeyFromObj = R.curry(
  (_key, _object) =>
    new Promise((resolve, reject) =>
      R.has(_key, _object)
        ? resolve(R.prop(_key, _object))
        : reject(
            new Error(`${ERROR_KEY_NOT_FOUND} ('${_key}' not found in ${JSON.stringify(_object)})`)
          )
    )
)

const getKeyFromObjThroughPath = R.curry((_path, _object) =>
  checkType('Array', _path)
    .then(_ => checkType('Object', _object))
    .then(_ => R.path(_path, _object))
    .then(_value =>
      R.isNil(_value)
        ? Promise.reject(
            new Error(
              `${ERROR_KEY_NOT_FOUND} - Path '[${_path}]' not found in ${JSON.stringify(_object)}`
            )
          )
        : Promise.resolve(_value)
    )
)

const getKeyFromObjThroughPossiblePaths = R.curry((_paths, _object) =>
  Promise.all(_paths.map(_path => R.path(_path, _object)))
    .then(_possibleValues => _possibleValues.filter(isNotNil))
    .then(_filteredValues =>
      _filteredValues.length === 0
        ? Promise.reject(new Error(`${ERROR_UNABLE_TO_FIND_PATHS} ${JSON.stringify(_object)}`))
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
