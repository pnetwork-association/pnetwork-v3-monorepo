const { logger } = require('../get-logger')
const { utils, constants } = require('ptokens-utils')
const { isNil, identity, memoizeWith } = require('ramda')
const {
  maybeProcessFinalTransactions: evmMaybeProcessFinalTransactions,
} = require('../evm/evm-process-final-txs')

const getStub = memoizeWith(
  identity,
  _blockChainType =>
    new Promise((resolve, reject) => {
      let stub = null
      logger.info(
        `Getting stub for pollForRequests for blockchain type ${_blockChainType}`
      )
      const error = `Stub for blockchain type ${_blockChainType} not found, is it implemented?`
      switch (_blockChainType) {
        case constants.blockchainType.EVM:
          stub = evmMaybeProcessFinalTransactions
          break
        // case constants.blockchainType.ALGORAND:
        //   stub = algoPollForRequests
        //   break
        default:
          return reject(new Error(error))
      }

      return isNil(stub)
        ? reject(new Error(`Invalid block chain type: ${_blockChainType}`))
        : resolve(stub)
    })
)

const maybeProcessFinalTransactions = _state =>
  utils
    .getBlockchainTypeFromChainId(_state[constants.STATE_KEY_CHAIN_ID])
    .then(getStub)

module.exports = {
  maybeProcessFinalTransactions,
}
