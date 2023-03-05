const { assoc } = require('ramda')
const { logger } = require('../get-logger')
const { STATE_KEY_ONCHAIN_REQUESTS } = require('../state/constants')

const getOnChainQueuedRequestsAndPutInState = _state => {
  logger.info('Getting EVM on chain requests and putting in state...')
  return Promise.resolve(assoc(STATE_KEY_ONCHAIN_REQUESTS, [], _state))
}

module.exports = {
  getOnChainQueuedRequestsAndPutInState,
}
