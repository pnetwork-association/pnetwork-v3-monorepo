const { logger } = require('../get-logger')
const errors = require('../errors')
// const { logic } = require('ptokens-utils')

const ETHERS_KEY_TX_HASH = 'hash'

const callContractFunction = (_fxnName, _fxnArgs, _contract) =>
  _contract[_fxnName](..._fxnArgs).catch(_err => {
    if (_err.message.includes(errors.ERROR_ESTIMATE_GAS)) {
      const revertData = _err.data
      const decodedError = _contract.interface.parseError(revertData)
      if (decodedError) {
        if (decodedError.name === 'OperationAlreadyExecuted')
          return Promise.reject(
            new Error(errors.ERROR_OPERATION_ALREADY_EXECUTED)
          )
        else if (decodedError.name === 'OperationAlreadyQueued')
          return Promise.reject(
            new Error(errors.ERROR_OPERATION_ALREADY_QUEUED)
          )
        else if (decodedError.name === 'OperationNotQueued')
          return Promise.reject(new Error(errors.ERROR_OPERATION_NOT_QUEUED))
      }
    }
    return Promise.reject(_err)
  })

const callContractFunctionAndAwait = (
  _fxnName,
  _fxnArgs,
  _contract,
  _txTimeout = 50000
) =>
  logger.debug(
    `Calling ${_fxnName} in contracts and awaiting for tx receipt...`
  ) ||
  callContractFunction(_fxnName, _fxnArgs, _contract)
    .then(
      _tx =>
        logger.debug(`Function ${_fxnName} called, awaiting...`) || _tx.wait()
      // logic.racePromise(_txTimeout, _tx.wait, [])
    )
    .then(
      _tx =>
        logger.info(
          `${_fxnName} call mined successfully ${_tx[ETHERS_KEY_TX_HASH]}`
        ) || _tx
    )

module.exports = {
  ETHERS_KEY_TX_HASH,
  callContractFunctionAndAwait,
}
