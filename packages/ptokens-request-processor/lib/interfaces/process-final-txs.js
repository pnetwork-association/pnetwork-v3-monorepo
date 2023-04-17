const { constants: ptokensUtilsConstants } = require('ptokens-utils')
const constants = require('ptokens-constants')
const {
  processFinalTransactionsLoop: evmProcessFinalTransactionsLoop,
} = require('../evm/evm-process-final-txs')
const {
  getImplementationFromChainId,
} = require('../get-implementation-from-chainid')

const blockchainTypeImplementationMapping = {
  [ptokensUtilsConstants.blockchainType.EVM]: evmProcessFinalTransactionsLoop,
  // [ptokensUtilsConstants.blockchainType.ALGORAND]: evmprocessFinalTransactionsLoop
}

const processFinalTransactions = _state =>
  getImplementationFromChainId(
    _state[constants.state.STATE_KEY_NETWORK_ID],
    'processFinalTransactions',
    blockchainTypeImplementationMapping
  ).then(_implementedMethod => _implementedMethod(_state))

module.exports = {
  processFinalTransactions,
}
