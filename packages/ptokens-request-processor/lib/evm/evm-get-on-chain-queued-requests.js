const R = require('ramda')
const { logger } = require('../get-logger')
const { STATE_ONCHAIN_REQUESTS } = require('../state/constants')

const getOnChainQueuedRequestsAndPutInState = _state => {
  logger.info('Getting EVM on chain requests and putting in state...')
  return Promise.resolve(R.assoc(STATE_ONCHAIN_REQUESTS, [], _state))
}

module.exports = {
  getOnChainQueuedRequestsAndPutInState,
}
