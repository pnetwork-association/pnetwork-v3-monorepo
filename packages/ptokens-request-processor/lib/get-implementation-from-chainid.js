const { logger } = require('./get-logger')
const { keys, memoizeWith } = require('ramda')
const { utils } = require('ptokens-utils')

/**
 * Select the implementation from the given mapping
 * base on the given chain id.
 * @param  {[type]} _chainId       metadata chain id
 * @param  {[type]} _functionName  name of the function (for logging purposes)
 * @param  {[type]} _mapping       map blockChainType => function
 * @return {[type]}                the function defined in the _mapping object
 *                                 related to the given _chainId
 */
const getImplementationFromChainId = memoizeWith(
  (a, b, _) => a + b,
  (_chainId, _functionName, _mapping) =>
    utils.getBlockchainTypeFromChainId(_chainId).then(_blockChainType => {
      logger.info(
        `Getting implementation for '${_functionName}' for blockchain type ${_blockChainType}...`
      )
      if (utils.doesNotInclude(_blockChainType, keys(_mapping))) {
        return Promise.reject(
          new Error(
            `Implementation of ${_functionName} for ${_blockChainType} not found!`
          )
        )
      }
      return _mapping[_blockChainType]
    })
)

module.exports = {
  getImplementationFromChainId,
}
