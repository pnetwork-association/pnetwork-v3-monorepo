const constants = require('ptokens-constants')
const { logic } = require('ptokens-utils')
const { logger } = require('../get-logger')
const errors = require('../errors')

const callContractFunction = (_fxnName, _fxnArgs, _contract) =>
  _contract[_fxnName](..._fxnArgs).catch(_err => {
    if (_err.message.includes(constants.evm.ethers.ERROR_ESTIMATE_GAS)) {
      const revertData = _err.data
      const decodedError = _contract.interface.parseError(revertData)
      if (decodedError) {
        if (decodedError.name === 'OperationAlreadyExecuted')
          return Promise.reject(new Error(errors.ERROR_OPERATION_ALREADY_EXECUTED))
        else if (decodedError.name === 'OperationAlreadyQueued')
          return Promise.reject(new Error(errors.ERROR_OPERATION_ALREADY_QUEUED))
        else if (decodedError.name === 'OperationNotQueued')
          return Promise.reject(new Error(errors.ERROR_OPERATION_NOT_QUEUED))
      }
    } else if (_err.message.includes(constants.evm.ethers.ERROR_REPLACEMENT_UNDERPRICED)) {
      return Promise.reject(new Error(errors.ERROR_REPLACEMENT_UNDERPRICED))
    } else {
      return Promise.reject(_err)
    }
  })

const callContractFunctionAndAwait = (_fxnName, _fxnArgs, _contract, _txTimeout = 50000) =>
  logger.debug(`Calling ${_fxnName} in contracts and awaiting for tx receipt...`) ||
  callContractFunction(_fxnName, _fxnArgs, _contract)
    .then(
      _tx =>
        logger.debug(`Function ${_fxnName} called, awaiting...`) ||
        logic.racePromise(_txTimeout, _tx.wait.bind(_tx), [])
    )
    .then(
      _tx =>
        logger.info(
          `${_fxnName} call mined successfully ${_tx[constants.evm.ethers.KEY_TX_HASH]}`
        ) || _tx
    )

module.exports = {
  callContractFunctionAndAwait,
}
