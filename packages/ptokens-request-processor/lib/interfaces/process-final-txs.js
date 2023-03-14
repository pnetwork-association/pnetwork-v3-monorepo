const { utils, constants } = require('ptokens-utils')
const {
  maybeProcessFinalTransactions: evmMaybeProcessFinalTransactions,
} = require('../evm/evm-process-final-txs')
const {
  getImplementationFromChainId,
} = require('../get-implementation-from-chainid')

const blockchainTypeImplementationMapping = {
  [constants.blockchainType.EVM]: evmMaybeProcessFinalTransactions,
  // [constants.blockchainType.ALGORAND]: evmMaybeProcessFinalTransactions
}

const maybeProcessFinalTransactions = _state =>
  utils
    .getBlockchainTypeFromChainId(_state[constants.STATE_KEY_CHAIN_ID])
    .then(_blockChainType =>
      getImplementationFromChainId(
        _blockChainType,
        'maybeProcessFinalTransactions',
        blockchainTypeImplementationMapping
      )
    )
    .then(_implementedMethod => _implementedMethod(_state))

module.exports = {
  maybeProcessFinalTransactions,
}
