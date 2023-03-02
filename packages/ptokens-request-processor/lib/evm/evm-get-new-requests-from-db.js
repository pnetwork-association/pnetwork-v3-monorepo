const { logger } = require('../get-logger')

const evmGetNewRequestsFromDbAndPutInState = _state => {
  logger.info('getNewRequestsFromDbAndPutInState EVM')
  return Promise.resolve(_state)
}

module.exports = {
  evmGetNewRequestsFromDbAndPutInState,
}
