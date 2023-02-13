const { promisify } = require('node:util')
const writeFile = promisify(require('fs').writeFile)
const readdir = promisify(require('fs').readdir)
const { logger } = require('../logger')
const { isNil, curry } = require('ramda')
const { ERROR_INVALID_OBJECT } = require('../errors')

const listFilesInFolder = _folder => readdir(_folder)

const writeThingToDisk = curry((_path, _thing) =>
  isNil(_thing)
    ? Promise.reject(new Error(`${ERROR_INVALID_OBJECT}: ${_thing}`))
    : writeFile(_path, JSON.stringify(_thing)).then(
        _ => logger.debug(`File ${_path} written successfully!`) || _path
      )
)

module.exports = {
  writeThingToDisk,
  listFilesInFolder,
}
