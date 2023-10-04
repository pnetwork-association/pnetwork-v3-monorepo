const { ErrorDescription } = require('ethers')
const { utils } = require('ptokens-utils')

class HubError extends Error {
  constructor(_contract, _err) {
    super()
    const error = utils.isNotNil(_err.data) ? _contract.interface.parseError(_err.data) : _err

    this.message =
      error instanceof ErrorDescription ? `${error.name}(${error.args})` : error.message
  }
}

module.exports = {
  HubError,
}
