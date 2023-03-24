const { constants } = require('ptokens-utils')
const {
  pollForRequestsAndDismissLoop: evmPollForRequestsAndDismissLoop,
} = require('../evm/evm-process-dismissal-txs')
const {
  getImplementationFromChainId,
} = require('../get-implementation-from-chainid')

const blockchainTypeImplementationMapping = {
  [constants.blockchainType.EVM]: evmPollForRequestsAndDismissLoop,
}

const pollForRequestsAndDismiss = _state =>
  getImplementationFromChainId(
    _state[constants.STATE_KEY_CHAIN_ID],
    'pollForRequestsAndDismiss',
    blockchainTypeImplementationMapping
  ).then(_implementedMethod => _implementedMethod(_state))

module.exports = {
  pollForRequestsAndDismiss,
}
