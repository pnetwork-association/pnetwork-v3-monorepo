const R = require('ramda')
const constants = require('ptokens-constants')
const { logger } = require('../../get-logger')
const { updateActorStatus } = require('../../update-actor-status')
const { parseEthersErrorOrReject } = require('./parse-ethers-error')

const formatErrorDescription = _parsedError =>
  `${_parsedError.name}(${_parsedError.args.join(', ')})`

const errorDescriptionHandler = R.curry(
  (_actorsStorage, _challengeStorage, _actorAddress, _supportedChain, _errDescription) => {
    const chainName = _supportedChain[constants.config.KEY_CHAIN_NAME]
    const formattedMsg = formatErrorDescription(_errDescription)
    if (formattedMsg.includes(constants.hub.errors.ACTOR_CHALLENGED)) {
      logger.warn(`${_actorAddress} already challenged on '${chainName}'`)
      return updateActorStatus(_actorsStorage, _actorAddress, constants.hub.actorsStatus.Challenged)
    } else if (formattedMsg.includes(constants.hub.errors.ACTOR_INACTIVE)) {
      logger.warn(`${_actorAddress} is inactive on '${chainName}'`)
      return updateActorStatus(_actorsStorage, constants.hub.actorsStatus.Inactive)
    } else {
      logger.error('Error description not handled when starting a challenge:')
      logger.error(formattedMsg)
    }
  }
)

module.exports.startChallengeErrorHandler = R.curry(
  (
    resolve,
    reject,
    _actorsStorage,
    _challengesStorage,
    _hub,
    _actorAddress,
    _supportedChain,
    _err
  ) =>
    parseEthersErrorOrReject(_hub, _err)
      .then(
        errorDescriptionHandler(_actorsStorage, _challengesStorage, _actorAddress, _supportedChain)
      )
      .then(resolve)
      .catch(reject)
)
