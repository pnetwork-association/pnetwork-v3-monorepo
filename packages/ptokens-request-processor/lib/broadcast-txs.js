const { logger } = require('./get-logger')

const maybeBroadcastTxs = _state => {
  logger.info('maybeBroadcastTxs')
  return Promise.resolve(_state)
}

module.exports = {
  maybeBroadcastTxs,
}
