const constants = require('./constants')
const { spawn } = require('node:child_process')

module.exports.ping = _peer =>
  new Promise((resolve, reject) => {
    const ping = spawn(constants.IPFS_EXEC, constants.IPFS_ARGS_PING)

    const stderr = []
    const stdout = []

    ping.stdin.write(_peer)
    ping.stdin.end()

    ping.stdout.on('data', data => {
      stdout.push(data.toString())
    })
    ping.stderr.on('data', data => {
      stderr.push(data.toString())
    })

    ping.on('close', () => {
      if (stderr.length !== 0) reject(new Error(stderr.join('')))
      else resolve(stdout.join(''))
    })
  })
