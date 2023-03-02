const { logger } = require('../get-logger')

const evmGetOnChainQueuedRequestsAndPutInState = _state => {
  logger.info('getOnChainQueuedRequestsAndPutInState EVM')
  return Promise.resolve(_state)
}

module.exports = {
  evmGetOnChainQueuedRequestsAndPutInState,
}
