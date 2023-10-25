const R = require('ramda')
const { STATE_STATUS_OBJ_KEY } = require('../constants')
const { ERROR_UNSUPPORTED_PROTOCOL } = require('../errors')
const protocols = require('../protocols')
const pTokensConstants = require('ptokens-constants')

const publishStatus = R.curry(
  (_status, _protocolConfig) =>
    new Promise((resolve, reject) => {
      const protocolType = _protocolConfig[pTokensConstants.config.KEY_TYPE]
      const protocolData = _protocolConfig[pTokensConstants.config.KEY_DATA]
      const publishStatusImpl = protocols[protocolType].publishStatus

      return R.isNil(publishStatusImpl)
        ? reject(new Error(`${ERROR_UNSUPPORTED_PROTOCOL}: '${protocolType}'`))
        : publishStatusImpl(protocolData, _status).then(resolve).catch(reject)
    })
)

const publishStatusObjectAndReturnState = _state =>
  new Promise((resolve, reject) => {
    const protocols = _state[pTokensConstants.config.KEY_PROTOCOLS]
    const status = _state[STATE_STATUS_OBJ_KEY]

    return Promise.all(protocols.map(publishStatus(status)))
      .then(R.identity(_state))
      .then(resolve)
      .catch(reject)
  })

module.exports = {
  publishStatusObjectAndReturnState,
}
