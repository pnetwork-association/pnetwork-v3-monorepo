const R = require('ramda')
const { logger } = require('./get-logger')
const constants = require('ptokens-constants')
const protocols = require('./protocols')
const { ERROR_UNSUPPORTED_PROTOCOL } = require('./errors')
// const { STATE_MEMORY_KEY } = require('./constants')
// const { verifySignature } = require('./verify-signature')

const onMessageHandler = R.curry((_state, _message) => {
  // const memory = _state[STATE_MEMORY_KEY]
  // const address = _state[] // TODO: create schema!!!!
  // console.log('memory:', memory)
  logger.info('New message:', _message)

  // if (verifySignature(_))
})

const readStatus = R.curry(
  (_state, _protocolConfig) =>
    new Promise((resolve, reject) => {
      const protocolType = _protocolConfig[constants.config.KEY_TYPE]
      const protocolData = _protocolConfig[constants.config.KEY_DATA]
      const readStatusImpl = protocols[protocolType].readStatus

      return R.isNil(readStatusImpl)
        ? reject(new Error(`${ERROR_UNSUPPORTED_PROTOCOL} '${protocolType}'`))
        : readStatusImpl(protocolData, onMessageHandler(_state)).then(resolve).catch(reject)
    })
)

module.exports.getSyncStateAndUpdateTimestamps = _state =>
  new Promise((resolve, reject) => {
    const protocols = _state[constants.config.KEY_PROTOCOLS]

    protocols.map(readStatus(_state))

    return resolve(R.identity(_state)).then(resolve).catch(reject)
  })
