const { logger } = require('./get-logger')
const { keys, memoizeWith } = require('ramda')
const { utils } = require('ptokens-utils')

const getImplementationFromChainId = memoizeWith(
  (a, b, _) => a + b,
  (_blockChainType, _functionName, _mapping) =>
    new Promise((resolve, reject) => {
      logger.info(
        `Getting implementation for '${_functionName}' for blockchain type ${_blockChainType}...`
      )

      if (utils.doesNotInclude(_blockChainType, keys(_mapping))) {
        return reject(
          new Error(
            `Implementation of ${_functionName} for ${_blockChainType} not found!`
          )
        )
      }

      return resolve(_mapping[_blockChainType])
    })
)

module.exports = {
  getImplementationFromChainId,
}
