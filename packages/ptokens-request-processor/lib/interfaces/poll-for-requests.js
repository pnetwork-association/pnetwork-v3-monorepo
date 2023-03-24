const { constants: ptokensUtilsConstants } = require('ptokens-utils')
const constants = require('ptokens-constants')
const {
  pollForRequestsAndDismiss: evmPollForRequestsAndDismiss,
  pollForRequestsAndPropose: evmPollForRequestsAndPropose,
} = require('../evm/evm-process-proposal-txs')
const {
  getImplementationFromChainId,
} = require('../get-implementation-from-chainid')

const blockchainTypeImplementationMapping = {
  [ptokensUtilsConstants.blockchainType.EVM]: {
    propose: evmPollForRequestsAndPropose,
    dismiss: evmPollForRequestsAndDismiss,
  },
  // [ptokensUtilsConstants.blockchainType.ALGORAND]: algoPollForRequests
}

const pollForRequestsAndDismiss = _state =>
  getImplementationFromChainId(
    _state[constants.state.STATE_KEY_CHAIN_ID],
    'pollForRequests',
    blockchainTypeImplementationMapping
  ).then(_implementedMethod => _implementedMethod.dismiss(_state))

const pollForRequestsAndPropose = _state =>
  getImplementationFromChainId(
    _state[constants.state.STATE_KEY_CHAIN_ID],
    'pollForRequestsAndPropose',
    blockchainTypeImplementationMapping
  ).then(_implementedMethod => _implementedMethod.propose(_state))

module.exports = {
  pollForRequestsAndPropose,
  pollForRequestsAndDismiss,
}
