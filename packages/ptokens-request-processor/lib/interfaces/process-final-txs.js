const { logger } = require('../get-logger')
const { utils, constants } = require('ptokens-utils')
const { isNil, identity, memoizeWith } = require('ramda')
const {
  maybeProcessFinalTransactions: evmMaybeProcessFinalTransactions,
} = require('../evm/evm-process-final-txs')

const getImplementationFromChainId = memoizeWith(
  identity,
  _blockChainType =>
    new Promise((resolve, reject) => {
      let implementation = null
      logger.info(
        `Getting implementation for processFinalTxs for blockchain type ${_blockChainType}`
      )
      const error = `implementation for blockchain type ${_blockChainType} not found, is it implemented?`
      switch (_blockChainType) {
        case constants.blockchainType.EVM:
          implementation = evmMaybeProcessFinalTransactions
          break
        // case constants.blockchainType.ALGORAND:
        //   implementation = algoPollForRequests
        //   break
        default:
          return reject(new Error(error))
      }

      return isNil(implementation)
        ? reject(new Error(`Invalid block chain type: ${_blockChainType}`))
        : resolve(implementation)
    })
)

const maybeProcessFinalTransactions = _state =>
  utils
    .getBlockchainTypeFromChainId(_state[constants.STATE_KEY_CHAIN_ID])
    .then(getImplementationFromChainId)
    .then(_processFinalTxsImplementation =>
      _processFinalTxsImplementation(_state)
    )

module.exports = {
  maybeProcessFinalTransactions,
}
