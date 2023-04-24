const constants = require('ptokens-constants')
const { constants: ptokensUtilsConstants } = require('ptokens-utils')
const {
  pollForRequestsAndDismissLoop: evmPollForRequestsAndDismissLoop,
} = require('../evm/evm-process-dismissal-txs')
const { getImplementationFromChainId } = require('../get-implementation-from-chainid')

const blockchainTypeImplementationMapping = {
  [ptokensUtilsConstants.blockchainType.EVM]: evmPollForRequestsAndDismissLoop,
}

const pollForRequestsAndDismiss = _state =>
  getImplementationFromChainId(
    _state[constants.state.KEY_NETWORK_ID],
    'pollForRequestsAndDismiss',
    blockchainTypeImplementationMapping
  ).then(_implementedMethod => _implementedMethod(_state))

module.exports = {
  pollForRequestsAndDismiss,
}
