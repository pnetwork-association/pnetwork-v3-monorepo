const { constants: ptokensUtilsConstants } = require('ptokens-utils')
const constants = require('ptokens-constants')
const {
  pollForRequestsAndProposeLoop: evmPollForRequestsAndProposeLoop,
} = require('../evm/evm-process-proposal-txs')
const { getImplementationFromChainId } = require('../get-implementation-from-chainid')

const blockchainTypeImplementationMapping = {
  [ptokensUtilsConstants.blockchainType.EVM]: evmPollForRequestsAndProposeLoop,
}

const pollForRequestsAndPropose = _state =>
  getImplementationFromChainId(
    _state[constants.state.KEY_NETWORK_ID],
    'pollForRequestsAndPropose',
    blockchainTypeImplementationMapping
  ).then(_implementedMethod => _implementedMethod(_state))

module.exports = {
  pollForRequestsAndPropose,
}
