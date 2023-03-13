const { logger } = require('../get-logger')
const { utils, constants } = require('ptokens-utils')
const { isNil, identity, memoizeWith } = require('ramda')
const {
  pollForRequests: evmPollForRequests,
} = require('../evm/evm-poll-for-requests')

const getImplementationFromChainId = memoizeWith(
  identity,
  _blockChainType =>
    new Promise((resolve, reject) => {
      let implementation = null
      logger.info(
        `Getting implementation for processFinalTxs for blockchain type ${_blockChainType}`
      )
      switch (_blockChainType) {
        case constants.blockchainType.EVM:
          implementation = evmPollForRequests
          break
        // case constants.blockchainType.ALGORAND:
        //   implementation = algoPollForRequests
        //   break
        default:
          return reject(
            new Error(
              `implementation for blockchain type ${_blockChainType} not found, is it implemented?`
            )
          )
      }

      return isNil(implementation)
        ? reject(new Error(`Invalid block chain type: ${_blockChainType}`))
        : resolve(implementation)
    })
)

const pollForRequests = _state =>
  utils
    .getBlockchainTypeFromChainId(_state[constants.STATE_KEY_CHAIN_ID])
    .then(getImplementationFromChainId)
    .then(_pollForRequestsImplementation =>
      _pollForRequestsImplementation(_state)
    )

module.exports = {
  pollForRequests,
}
