const {
  ERROR_ENCLAVE_CALL_FAILED,
  ERROR_ENCLAVE_CALL_TIMEOUT,
} = require('../errors')
const { isNil } = require('ramda')
const { logger } = require('../logger')
const { promisify } = require('node:util')
const execFile = promisify(require('node:child_process').execFile)

const call = (_path, _executable, _args, _timeout = 0) =>
  logger.trace(`Executing enclave command ${_path}/${_executable} ${_args}`) ||
  execFile(_executable, _args, { cwd: _path, timeout: _timeout })
    .then(({ stdout, stderr }) =>
      !isNil(stderr) && stderr.includes('✘')
        ? Promise.reject(new Error(`${ERROR_ENCLAVE_CALL_FAILED} - ${stderr}`))
        : stdout.trim()
    )
    .catch(_err => {
      if (_err.killed && _err.signal === 'SIGTERM')
        return Promise.reject(new Error(ERROR_ENCLAVE_CALL_TIMEOUT))
      else if (_err.code === 'ENOENT')
        return Promise.reject(new Error(`${ERROR_ENCLAVE_CALL_FAILED} - Executable '${_executable}' not found @ ${_path}!`))
      else
        return Promise.reject(_err)
    })

module.exports = {
  call
}