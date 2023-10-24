const R = require('ramda')
const { logger } = require('../../get-logger')
const { ipfs, utils } = require('ptokens-utils')

const errorHandler = _err => new Promise.reject(new Error(_err))

const readStatus = R.curry((_protocolData, _onMessageHandler) =>
  utils
    .getKeyFromObj('topic', _protocolData)
    .then(_topic => logger.info(`Getting status from IPFS(${_topic})`) || ipfs.pubsub.sub(_topic))
    .then(_sub => {
      _sub.on('message', _onMessageHandler)
      _sub.on('error', errorHandler)
      _sub.on('close', errorHandler) // Fired when the IFPS daemon is shutted down

      logger.info('Currently listening for new IPFS pubsub events...')

      return true
    })
)

module.exports = {
  readStatus,
}
