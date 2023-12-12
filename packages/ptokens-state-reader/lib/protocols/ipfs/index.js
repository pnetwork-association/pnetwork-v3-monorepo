const R = require('ramda')
const { logger } = require('../../get-logger')
const { ipfs, utils } = require('ptokens-utils')

const errorHandler = _err => Promise.reject(new Error(_err))

const readStatus = R.curry((_protocolData, _onMessageHandler) =>
  Promise.all([
    utils.getKeyFromObj('url', _protocolData),
    utils.getKeyFromObj('topic', _protocolData),
  ])
    .then(([_url, _topic]) => {
      logger.info(`Getting status from IPFS(${_topic})`)
      const provider = new ipfs.IPFSProvider(_url)
      const pubSub = new ipfs.PubSub(provider)
      return pubSub.sub(_topic)
    })
    .then(_sub => {
      _sub.on('message', _onMessageHandler)
      _sub.on('error', errorHandler)
      _sub.on('close', errorHandler) // Fired when the IFPS daemon is shut down

      logger.info('Currently listening for new IPFS pubsub events...')
      return
    })
)

module.exports = {
  readStatus,
}
