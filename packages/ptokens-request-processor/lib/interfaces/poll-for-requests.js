const { utils, constants } = require('ptokens-utils')
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
  utils
    .getBlockchainTypeFromChainId(_state[constants.STATE_KEY_CHAIN_ID])
    .then(_blockChainType =>
      getImplementationFromChainId(
        _blockChainType,
        'pollForRequests',
        blockchainTypeImplementationMapping
      )
    )
    .then(_implementedMethod => _implementedMethod(_state))

module.exports = {
  pollForRequests,
}
