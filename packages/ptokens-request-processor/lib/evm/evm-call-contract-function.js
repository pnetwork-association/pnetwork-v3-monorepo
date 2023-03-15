const { curry } = require('ramda')
const { logger } = require('../get-logger')
const { logic } = require('ptokens-utils')

const callContractFunction = (_fxnName, _fxnArgs, _contract) =>
  _contract[_fxnName](..._fxnArgs)

const callContractFunctionAndAwait = curry(
  (_fxnName, _fxnArgs, _contract) =>
    logger.debug(
      `Calling ${_fxnName} in contracts and awaiting for tx receipt...`
    ) ||
    callContractFunction(_fxnName, _fxnArgs, _contract)
      .then(
        _tx =>
          logger.debug(`Function ${_fxnName} called, awaiting...`) ||
          logic.racePromise(5000, _tx.wait, [])
      )
      .then(
        _tx =>
          logger.info(
            `${_fxnName} call mined successfully ${_tx.transactionHash}`
          ) || _tx
      )
)

module.exports = {
  callContractFunctionAndAwait,
}
