const { constants: ptokensUtilsConstants } = require('ptokens-utils')
const constants = require('ptokens-constants')
const {
  maybeProcessFinalTransactions: evmMaybeProcessFinalTransactions,
} = require('../evm/evm-process-final-txs')
const {
  getImplementationFromChainId,
} = require('../get-implementation-from-chainid')

const blockchainTypeImplementationMapping = {
  [ptokensUtilsConstants.blockchainType.EVM]: evmMaybeProcessFinalTransactions,
  // [ptokensUtilsConstants.blockchainType.ALGORAND]: evmMaybeProcessFinalTransactions
}

const maybeProcessFinalTransactions = _state =>
  getImplementationFromChainId(
    _state[constants.state.STATE_KEY_CHAIN_ID],
    'maybeProcessFinalTransactions',
    blockchainTypeImplementationMapping
  ).then(_implementedMethod => _implementedMethod(_state))

module.exports = {
  maybeProcessFinalTransactions,
}
