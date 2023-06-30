const ethers = require('ethers')
const constants = require('ptokens-constants')
const { logger } = require('../get-logger')
const { StateManagerError } = require('./evm-state-manager-error')

const callContractFunction = (_contract, _fxnName, _fxnArgs) => {
  switch (_fxnName) {
    case 'protocolExecuteOperation':
      return _contract.protocolExecuteOperation(..._fxnArgs)
    case 'protocolQueueOperation':
      return _contract.protocolQueueOperation(..._fxnArgs)
    case 'protocolGuardianCancelOperation':
      return _contract.protocolGuardianCancelOperation(..._fxnArgs)
    default:
      return Promise.reject(new Error(`Unrecognized contract call for ${_fxnName}`))
  }
}

const callContractFunctionAndAwait = (_fxnName, _fxnArgs, _contract, _txTimeout = 50000) =>
  logger.debug(`Calling ${_fxnName} in contracts and awaiting for tx receipt...`) ||
  callContractFunction(_contract, _fxnName, _fxnArgs)
    .then(_tx => logger.debug(`Function ${_fxnName} called, awaiting...`) || _tx.wait())
    .then(
      _tx =>
        logger.info(
          `${_fxnName} call mined successfully ${_tx[constants.evm.ethers.KEY_TX_HASH]}`
        ) || _tx
    )
    .catch(_err => {
      if (_err.message.includes(constants.evm.ethers.ERROR_ESTIMATE_GAS)) {
        const decodedError = _contract.interface.parseError(_err.data)
        if (decodedError instanceof ethers.ErrorDescription) {
          return Promise.reject(new StateManagerError(decodedError))
        }
      } else {
        return Promise.reject(_err)
      }
    })

module.exports = {
  callContractFunctionAndAwait,
}
