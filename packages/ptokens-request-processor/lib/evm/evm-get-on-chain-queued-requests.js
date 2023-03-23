const { assoc } = require('ramda')
const { logger } = require('../get-logger')
const { STATE_ONCHAIN_REQUESTS_KEY } = require('../state/constants')

const getOnChainQueuedRequestsAndPutInState = _state => {
  logger.info('Getting EVM on chain requests and putting in state...')
  return Promise.resolve(assoc(STATE_ONCHAIN_REQUESTS_KEY, [], _state))
}

module.exports = {
  getOnChainQueuedRequestsAndPutInState,
}
