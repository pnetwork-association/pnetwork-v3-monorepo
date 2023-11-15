const R = require('ramda')
const constants = require('ptokens-constants')
const protocols = require('./protocols')
const { logger } = require('./get-logger')
const { db, utils, errors, validation } = require('ptokens-utils')
const { verifySignature } = require('./verify-signature')
const {
  STATE_DB_ACTORS_KEY,
  STATE_DB_ACTORS_PROPAGATED_KEY,
  ID_ACTORS_PROPAGATED,
} = require('./constants')
const { ERROR_UNSUPPORTED_PROTOCOL, ERROR_UNABLE_TO_FIND_ACTOR_FOR_EPOCH } = require('./errors')
const { refreshActorStatus } = require('./refresh-actor-status')

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
    .then(validation.validateJson(constants.statusObject.schemas.statusObject))
    .then(async _statusObj => {
      logger.info('Received new status object:', JSON.stringify(_statusObj))
      const actorsStorage = _state[STATE_DB_ACTORS_KEY]
      const actorAddress = _statusObj[constants.statusObject.KEY_SIGNER_ADDRESS]
      const signature = _statusObj[constants.statusObject.KEY_SIGNATURE]
      const syncState = _statusObj[constants.statusObject.KEY_SYNC_STATE]
      const actorsPropagated = await db.findReportById(
        _state[STATE_DB_ACTORS_PROPAGATED_KEY],
        ID_ACTORS_PROPAGATED
      )

      if (!R.find(R.equals(R.toLower(actorAddress)), actorsPropagated.actors)) {
        // TODO: check actor's type too
        logger.info(`${ERROR_UNABLE_TO_FIND_ACTOR_FOR_EPOCH}: '${actorAddress}'`)
        return
      }

      if (verifySignature(_statusObj, signature)) {
        logger.info(`Valid signature for ${actorAddress}!`)
        await refreshActorStatus(
          actorsStorage,
          actorsPropagated.currentEpoch,
          actorAddress,
          syncState
        )
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
