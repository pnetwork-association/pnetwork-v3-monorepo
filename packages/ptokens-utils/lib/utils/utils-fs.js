const { existsSync } = require('fs')
const { logger } = require('../logger')
const R = require('ramda')
const { promisify } = require('node:util')
const { isNotEmpty } = require('./utils-ramda-ext')
const readdir = promisify(require('fs').readdir)
const writeFile = promisify(require('fs').writeFile)
const exec = promisify(require('node:child_process').exec)
const {
  ERROR_INVALID_OBJECT,
  ERROR_FILE_NOT_EXISTS,
  ERROR_GPG_DECRYPTION_FAILED,
} = require('../errors')

const listFilesInFolder = _folder => readdir(_folder)

const writeThingToDisk = R.curry((_path, _thing) =>
  R.isNil(_thing)
    ? Promise.reject(new Error(`${ERROR_INVALID_OBJECT}: ${_thing}`))
    : writeFile(_path, JSON.stringify(_thing)).then(
        _ => logger.debug(`File ${_path} written successfully!`) || _path
      )
)

const checkFileExistsOrReject = _file =>
  new Promise((resolve, reject) => {
    if (existsSync(_file)) {
      return resolve(_file)
    }
    return reject(new Error(`${ERROR_FILE_NOT_EXISTS}: ${_file}`))
  })

const readGpgEncryptedFile = _gpgFile =>
  checkFileExistsOrReject(_gpgFile)
    .then(_ => exec(`/usr/bin/gpg -d -q ${_gpgFile}`))
    .then(({ stdout, stderr }) => {
      if (isNotEmpty(stderr)) {
        logger.error('stderr: ', stderr)
        return Promise.reject(
          new Error(`${ERROR_GPG_DECRYPTION_FAILED}: ${_gpgFile}`)
        )
      }

      logger.info(`File ${_gpgFile} successfully decrypted!`)
      return R.trim(stdout)
    })

module.exports = {
  writeThingToDisk,
  listFilesInFolder,
  readGpgEncryptedFile,
  checkFileExistsOrReject,
}
