const { constants } = require('ptokens-utils')
const {
  pollForRequests: evmPollForRequests,
} = require('../evm/evm-poll-for-requests')
const {
  getImplementationFromChainId,
} = require('../get-implementation-from-chainid')

const blockchainTypeImplementationMapping = {
  [constants.blockchainType.EVM]: evmPollForRequests,
  // [constants.blockchainType.ALGORAND]: algoPollForRequests
}

const pollForRequests = _state =>
  getImplementationFromChainId(
    _state[constants.STATE_KEY_CHAIN_ID],
    'pollForRequests',
    blockchainTypeImplementationMapping
  ).then(_implementedMethod => _implementedMethod(_state))

module.exports = {
  pollForRequests,
}
