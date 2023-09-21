const constants = require('./constants')
const { promisify } = require('node:util')
const execFile = promisify(require('node:child_process').execFile)

module.exports.id = () =>
  execFile(constants.IPFS_EXEC, constants.IPFS_ARGS_ID)
    .then(({ stdout, stderr }) => {
      if (stderr.length) {
        return Promise.reject(new Error(stderr))
      }
      return stdout
    })
    .then(JSON.parse)
