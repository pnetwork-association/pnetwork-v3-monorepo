const { assoc } = require('ramda')
const { logger } = require('../get-logger')
const {
  STATE_DETECTED_DB_REPORTS_KEY,
  // STATE_ONCHAIN_REQUESTS_KEY,
} = require('../state/constants')

const filterOutOnChainRequestsAndPutInState = _state => {
  logger.info('Getting EVM on chain requests and putting in state...')
  const detectedTxs = _state[STATE_DETECTED_DB_REPORTS_KEY]
  // const onChainRequests = _state[STATE_ONCHAIN_REQUESTS_KEY]

  // TODO: filter out on chain requests
  Promise.resolve(assoc(STATE_DETECTED_DB_REPORTS_KEY, detectedTxs, _state))
}

module.exports = {
  filterOutOnChainRequestsAndPutInState,
}
