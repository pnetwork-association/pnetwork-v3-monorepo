const constants = require('ptokens-constants')
const {
  processFinalTransactionsLoop: evmProcessFinalTransactionsLoop,
} = require('../evm/evm-process-final-txs')
const { getImplementationFromChainId } = require('../get-implementation-from-chainid')

const blockchainTypeImplementationMapping = {
  [constants.blockchainType.EVM]: evmProcessFinalTransactionsLoop,
  // [constants.blockchainType.ALGORAND]: evmprocessFinalTransactionsLoop
}

const processFinalTransactions = _state =>
  getImplementationFromChainId(
    _state[constants.state.KEY_NETWORK_ID],
    'processFinalTransactions',
    blockchainTypeImplementationMapping
  ).then(_implementedMethod => _implementedMethod(_state))

module.exports = {
  processFinalTransactions,
}
