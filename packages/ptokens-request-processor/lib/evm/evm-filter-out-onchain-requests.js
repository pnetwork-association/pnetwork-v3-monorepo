const { assoc } = require('ramda')
const { constants: schemasConstants } = require('ptokens-schemas')
const {
  STATE_KEY_DETECTED_DB_REPORTS,
  STATE_KEY_ONCHAIN_REQUESTS,
} = require('../state/constants')

const filterOutOnChainRequestsAndPutInState = _state => {
  logger.info('Getting EVM on chain requests and putting in state...')
  const detectedTxs = _state[STATE_KEY_DETECTED_DB_REPORTS]
  const onChainRequests = _state[STATE_KEY_ONCHAIN_REQUESTS]

  // TODO: filter out on chain requests
  Promise.resolve(assoc(STATE_KEY_DETECTED_DB_REPORTS, detectedTxs, _state))
}

module.exports = {
  filterOutOnChainRequestsAndPutInState,
}
