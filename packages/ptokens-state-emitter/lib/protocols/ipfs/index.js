const R = require('ramda')
const { logger } = require('../../get-logger')
const { ipfs, utils, validation } = require('ptokens-utils')

const KEY_DATA_URL = 'url'
const KEY_DATA_TOPIC = 'topic'

module.exports.publishStatus = R.curry((_protocolData, _status) =>
  validation
    .checkType('Object', _status)
    .then(_ =>
      Promise.all([
        utils.getKeyFromObj(KEY_DATA_URL, _protocolData),
        utils.getKeyFromObj(KEY_DATA_TOPIC, _protocolData),
      ])
    )
    .then(([_url, _topic]) => {
      logger.info(`Publishing status on IPFS(${_topic})...`)
      const provider = new ipfs.IPFSProvider(_url)
      const pubSub = new ipfs.PubSub(provider)
      pubSub.pub(_topic, JSON.stringify(_status))
    })
    .then(_ => logger.info('Data published successfully on IPFS!'))
)
