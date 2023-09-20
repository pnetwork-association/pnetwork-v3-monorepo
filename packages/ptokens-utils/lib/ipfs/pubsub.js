const R = require('ramda')
const { logger } = require('../logger')
const EventEmitter = require('events')
const constants = require('./constants')
const { spawn } = require('node:child_process')
const { checkDaemon } = require('./check-daemon')

/**
 * Usage:
 *
 * const { ipfs } = require('ptokens-utils')
 * ...
 * try {
 *   await ipfs.pubsub.pub('topic', 'content')
 * } catch(e) {
 *   console.error(e)
 * }
 *
 **/
const pub = R.curry(
  (_topic, _content) =>
    new Promise((resolve, reject) => {
      // NOTE: we don't check the daemon is running
      // here as it'll be detected on stderr
      const args = constants.IPFS_PUBSUB_PUB_ARGS.slice()
      args.push(_topic)

      const pub = spawn(constants.IPFS_EXEC, args)

      const stderr = []
      const stdout = []

      logger.trace(`topic: '${_topic}'`)
      logger.trace('content:', _content)

      pub.stdin.write(_content + '\n')
      pub.stdin.end()

      pub.stdout.on('data', data => {
        stdout.push(data.toString())
      })
      pub.stderr.on('data', data => {
        stderr.push(data.toString())
      })

      pub.on('close', () => {
        if (stderr.length !== 0) reject(new Error(stderr.join('')))
        else resolve(stdout.join(''))
      })
    })
)

/**
 * Usage:
 *
 * const { ipfs } = require('ptokens-utils')
 * ...
 * const subscriber = await ipfs.pubsub.sub('topic')
 * subscriber.on('message', (message) => { console.log(`[${topic}]:`, message) })
 * subscriver.on('error', errorHandler)
 * subscriber.on('close', closeHandler) // Fired when the IFPS daemon is shutted down
 * ...
 **/
const sub = _topic =>
  checkDaemon().then(_ => {
    const args = constants.IPFS_PUBSUB_SUB_ARGS.slice()
    args.push(_topic)
    const sub = spawn(constants.IPFS_EXEC, args)

    const eventEmitter = new EventEmitter()

    const stderr = []
    sub.stdout.on('data', data => {
      eventEmitter.emit('message', data.toString())
    })

    sub.stderr.on('data', data => {
      eventEmitter.emit('error', data.toString())
    })

    sub.on('close', () => {
      eventEmitter.emit('close')
    })

    return stderr.length
      ? Promise.reject(new Error(stderr.join('')))
      : Promise.resolve(eventEmitter)
  })

module.exports = {
  pub,
  sub,
}
