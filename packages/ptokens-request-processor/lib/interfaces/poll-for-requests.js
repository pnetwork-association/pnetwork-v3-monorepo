const { constants } = require('ptokens-utils')
const {
  pollForRequestsAndDismiss: evmPollForRequestsAndDismiss,
  pollForRequestsAndPropose: evmPollForRequestsAndPropose,
} = require('../evm/evm-poll-for-requests')
const {
  getImplementationFromChainId,
} = require('../get-implementation-from-chainid')

const blockchainTypeImplementationMapping = {
  [constants.blockchainType.EVM]: {
    propose: evmPollForRequestsAndPropose,
    dismiss: evmPollForRequestsAndDismiss,
  },
  // [constants.blockchainType.ALGORAND]: algoPollForRequests
}

const pollForRequestsAndDismiss = _state =>
  getImplementationFromChainId(
    _state[constants.STATE_KEY_CHAIN_ID],
    'pollForRequestsAndDismiss',
    blockchainTypeImplementationMapping
  ).then(_implementedMethod => _implementedMethod.dismiss(_state))

const pollForRequestsAndPropose = _state =>
  getImplementationFromChainId(
    _state[constants.STATE_KEY_CHAIN_ID],
    'pollForRequestsAndPropose',
    blockchainTypeImplementationMapping
  ).then(_implementedMethod => _implementedMethod.propose(_state))

module.exports = {
  pollForRequestsAndPropose,
  pollForRequestsAndDismiss,
}
