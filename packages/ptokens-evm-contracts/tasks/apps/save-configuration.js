const R = require('ramda')
const fs = require('node:fs/promises')
const { FLAG_SHOW } = require('../constants')

const prettyStringify = _object => JSON.stringify(_object, null, 2)

const saveConfiguration = R.curry((_what, _path, _configuration) =>
  fs
    .writeFile(_path, prettyStringify(_configuration))
    .then(_ => console.info(`${_what} configuration saved to ${_path}`))
)

const showConfiguration = (_what, _configuration) =>
  console.info(`# ${_what} configuration`) || console.info(prettyStringify(_configuration))

module.exports.maybeSaveConfiguration = R.curry((taskArgs, _what, _path, _configuration) =>
  taskArgs[FLAG_SHOW]
    ? showConfiguration(_what, _configuration)
    : saveConfiguration(_what, _path, _configuration)
)
