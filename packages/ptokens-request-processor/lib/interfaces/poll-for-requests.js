const { logger } = require('../get-logger')
const { utils, constants } = require('ptokens-utils')
const { isNil, identity, memoizeWith } = require('ramda')
const {
  pollForRequests: evmPollForRequests,
} = require('../evm/evm-poll-for-requests')

const getStub = memoizeWith(
  identity,
  _blockChainType => console.log('stub') ||
    new Promise((resolve, reject) => {
      let stub = null
      logger.info(
        `Getting stub for pollForRequests for blockchain type ${_blockChainType}`
      )
      const error = `Stub for blockchain type ${_blockChainType} not found, is it implemented?`
      switch (_blockChainType) {
        case constants.blockchainType.EVM:
          stub = evmPollForRequests
          break
        // case constants.blockchainType.ALGORAND:
        //   stub = algoPollForRequests
        //   break
        default:
          return reject(new Error(error))
      }

      console.log('stub', stub)

      return isNil(stub)
        ? reject(new Error(`Invalid block chain type: ${_blockChainType}`))
        : resolve(stub)
    })
)

const pollForRequests = _state =>
  utils
    .getBlockchainTypeFromChainId(_state[constants.STATE_KEY_CHAIN_ID])
    .then(getStub)

module.exports = {
  pollForRequests,
}
