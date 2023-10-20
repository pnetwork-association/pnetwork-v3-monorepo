const { ErrorDescription } = require('ethers')
const { utils } = require('ptokens-utils')
const constants = require('ptokens-constants')

const parseUserOperationStatus = _err =>
  `Operation${utils.flipObjectPropertiesSync(constants.hub.operationStatus)[_err.args[0]]}`

const maybeGetInvalidUserOperationStatusMessage = _err =>
  _err.name === 'InvalidOperationStatus'
    ? parseUserOperationStatus(_err)
    : `${_err.name}(${_err.args.join(', ')})`

class HubError extends Error {
  constructor(_contract, _err) {
    super()

    const error = utils.isNotNil(_err.data) ? _contract.interface.parseError(_err.data) : _err

    this.message =
      error instanceof ErrorDescription
        ? maybeGetInvalidUserOperationStatusMessage(error)
        : error.message
  }
}

module.exports = {
  HubError,
}
