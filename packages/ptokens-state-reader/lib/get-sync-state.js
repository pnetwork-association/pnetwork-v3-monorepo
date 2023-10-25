const R = require('ramda')
const constants = require('ptokens-constants')
const protocols = require('./protocols')
const { logger } = require('./get-logger')
const { utils, errors, validation } = require('ptokens-utils')
const { verifySignature } = require('./verify-signature')
const { STATE_MEMORY_KEY, STATE_ACTORS_PROPAGATED_KEY } = require('./constants')
const { ERROR_UNSUPPORTED_PROTOCOL, ERROR_UNABLE_TO_FIND_ACTOR_FOR_EPOCH } = require('./errors')

const errorHandler = _err => {
  if (_err.message.includes(errors.ERROR_FAILED_TO_PARSE_JSON)) {
    logger.debug('Unable to parse JSON!')
    return Promise.resolve()
  } else {
    return Promise.reject(_err)
  }
}

const onMessageHandler = R.curry((_state, _message) =>
  utils
    .parseJsonAsync(_message)
    .then(validation.validateJson(constants.config.schemas.statusObject))
    .then(_statusObj => {
      logger.info('Received new status object:', JSON.stringify(_statusObj))
      const actorAddress = _statusObj[constants.config.KEY_SIGNER_ADDRESS]
      const signature = _statusObj[constants.config.KEY_SIGNATURE]
      const syncState = _statusObj[constants.config.KEY_SYNC_STATE]
      const actorsPropagated = _state[STATE_ACTORS_PROPAGATED_KEY]

      const Memory = _state[STATE_MEMORY_KEY]

      if (!R.find(R.equals(actorAddress), actorsPropagated.actors)) {
        // TODO: check actor's type too
        return Promise.reject(
          new Error(`${ERROR_UNABLE_TO_FIND_ACTOR_FOR_EPOCH}: '${actorAddress}'`)
        )
      }

      if (verifySignature(_statusObj, signature)) {
        logger.info(`Valid signature for ${actorAddress}!`)
        Memory.updateActorState(actorsPropagated.currentEpoch, actorAddress, syncState)
      } else {
        logger.info('Invalid signature, ignoring...')
      }
    })
    .catch(errorHandler)
)

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
