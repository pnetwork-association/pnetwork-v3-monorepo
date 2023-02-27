const { logger } = require('./get-logger')

const getNewRequestsFromDbAndPutInState = _state => {
  logger.info('getNewRequestsFromDbAndPutInState')
  return Promise.resolve(_state)
}

module.exports = {
  getNewRequestsFromDbAndPutInState,
}
