const R = require('ramda')
const constants = require('ptokens-constants')
const { logger } = require('../../get-logger')
const { ERROR_DRY_RUN } = require('../../errors')

const errorLog = R.curry((_function, _errKey, _err) => {
  const value = _err[_errKey]
  if (R.isNotNil(value)) {
    _function(value)
  }
})

const logRevert = _reason => {
  logger.error(`Transaction would revert with ${_reason}`)
}
const logInvocation = _invocation => {
  logger.error(`  ${_invocation.method}(${_invocation.args.join(', ')})`)
}

module.exports.generalErrorHandler = R.curry(
  (resolve, reject, _supportedChain, _challengerAddress, _err) => {
    const msg = _err.message
    if (msg.includes(constants.evm.ethers.ERROR_EXECUTION_REVERTED)) {
      errorLog(logRevert, 'reason', _err)
      errorLog(logInvocation, 'invocation', _err)
      logger.debug(_err.message)
      return resolve()
    } else if (msg.includes(constants.evm.ethers.ERROR_INSUFFICIENT_FUNDS)) {
      const networkId = _supportedChain[constants.config.KEY_CHAIN_NAME]
      logger.warn(`The account does not have enough funds! (${networkId}) `)
      logger.warn(`  ${_challengerAddress}`)
      return resolve()
    } else if (msg.includes(ERROR_DRY_RUN)) {
      logger.debug('Skipping computation as dry-run mode is enabled')
      return resolve()
    }

    return reject(_err)
  }
)
