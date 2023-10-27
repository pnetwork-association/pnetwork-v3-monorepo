const R = require('ramda')
const ethers = require('ethers')
const { utils } = require('ptokens-utils')
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

const formatErrorDescription = _parsedError =>
  `${_parsedError.name}(${_parsedError.args.join(', ')})`

const errorDescriptionHandler = (_actorAddress, _errDescription) =>
  new Promise((resolve, _) => {
    const formattedMsg = formatErrorDescription(_errDescription)
    if (formattedMsg.includes('InvalidActorStatus(1, 0)')) {
      logger.warn(`${_actorAddress} already challenged!`)
    } else {
      logger.warn(formattedMsg)
    }
    return resolve(null)
  })

module.exports.generalErrorHandler = R.curry(
  (_actorAddress, _wallet, _contract, _err) =>
    new Promise((resolve, reject) => {
      const msg = _err.message
      const data = _err['data']
      if (utils.isNotNil(data)) {
        const parsedError = _contract.interface.parseError(data)
        if (parsedError instanceof ethers.ErrorDescription) {
          return errorDescriptionHandler(_actorAddress, parsedError).then(resolve)
        } else {
          logger.debug(_err.message)
        }
        return resolve(null)
      } else if (msg.includes(constants.evm.ethers.ERROR_EXECUTION_REVERTED)) {
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
