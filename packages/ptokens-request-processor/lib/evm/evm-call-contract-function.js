const { logger } = require('../get-logger')
const { errors } = require('ptokens-utils')

const callContractFunction = (_fxnName, _fxnArgs, _contract) =>
  _contract[_fxnName](..._fxnArgs).catch(_err => {
    if (_err.message.includes(errors.ERROR_ESTIMATE_GAS)) {
      const revertData = _err.data
      const decodedError = _contract.interface.parseError(revertData)
      if (decodedError && decodedError.name === 'OperationAlreadyProcessed')
        return Promise.reject(
          new Error(errors.ERROR_OPERATION_ALREADY_PROCESSED)
        )
    }
    return Promise.reject(_err)
  })

const callContractFunctionAndAwait = (
  _fxnName,
  _fxnArgs,
  _contract,
  _txTimeout = 5000
) =>
  logger.debug(
    `Calling ${_fxnName} in contracts and awaiting for tx receipt...`
  ) ||
  callContractFunction(_fxnName, _fxnArgs, _contract)
    .then(
      _tx =>
        logger.debug(`Function ${_fxnName} called, awaiting...`) || _tx.wait()
    )
    .then(
      _tx =>
        logger.info(`${_fxnName} call mined successfully ${_tx.hash}`) || _tx
    )

module.exports = {
  callContractFunctionAndAwait,
}
