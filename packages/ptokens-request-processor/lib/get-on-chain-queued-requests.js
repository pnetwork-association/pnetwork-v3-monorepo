const { logger } = require('./get-logger')

const getOnChainQueuedRequestsAndPutInState = _state => {
  logger.info('getOnChainQueuedRequestsAndPutInState')
  return Promise.resolve(_state)
}

module.exports = {
  getOnChainQueuedRequestsAndPutInState,
}
