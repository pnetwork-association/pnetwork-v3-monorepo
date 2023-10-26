const R = require('ramda')
const constants = require('ptokens-constants')
const { logger } = require('../../get-logger')

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
  (_wallet, _err) =>
    new Promise((resolve, reject) => {
      const msg = _err.message
      if (msg.includes(constants.evm.ethers.ERROR_EXECUTION_REVERTED)) {
        errorLog(logRevert, 'reason', _err)
        errorLog(logInvocation, 'invocation', _err)
        logger.debug(_err.message)
        return resolve(null)
      }
      if (msg.includes(constants.evm.ethers.ERROR_INSUFFICIENT_FUNDS)) {
        logger.warn('The account does not have enough funds! ')
        logger.warn(`  ${_wallet.address}`)
        return resolve(null)
      }

      return reject(_err)
    })
)
