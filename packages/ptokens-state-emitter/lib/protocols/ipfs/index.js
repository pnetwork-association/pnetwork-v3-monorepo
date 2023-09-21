const R = require('ramda')
const { logger } = require('../../get-logger')
const { ipfs, utils, validation } = require('ptokens-utils')

module.exports.publishStatus = R.curry((_protocolData, _status) =>
  validation
    .checkType('Object', _status)
    .then(_ => utils.getKeyFromObj('topic', _protocolData))
    .then(
      _topic =>
        logger.info(`Publishing status on IPFS(${_topic})...`) ||
        ipfs.pubsub.pub(_topic, JSON.stringify(_status))
    )
    .then(_ => logger.info('Data published successfully on IPFS!'))
)
