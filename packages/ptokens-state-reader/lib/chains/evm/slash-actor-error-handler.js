const R = require('ramda')
const constants = require('ptokens-constants')
const { logger } = require('../../get-logger')
const { updateChallengeStatus } = require('../../update-challenge')
const { parseEthersErrorOrReject } = require('./parse-ethers-error')
const { updateActorStatus } = require('../../update-actor-status')

const formatErrorDescription = _parsedError =>
  `${_parsedError.name}(${_parsedError.args.join(', ')})`

const updateChallengeAndActorStatus = R.curry(
  (_actorsStorage, _challengesStorage, _challenge, _challengeStatus, _actorStatus) =>
    updateChallengeStatus(_challengesStorage, _challenge, _challengeStatus).then(_ =>
      updateActorStatus(_actorsStorage, _actorStatus, _challenge.actor, _challenge.networkId)
    )
)

const errorDescriptionHandler = R.curry(
  (_actorsStorage, _challengesStorage, _supportedChain, _challenge, _errDescription) => {
    const chainName = _supportedChain[constants.config.KEY_CHAIN_NAME]
    const formattedMsg = formatErrorDescription(_errDescription)
    if (formattedMsg.includes(constants.hub.errors.CHALLENGE_SOLVED)) {
      logger.warn(`${_challenge.actor} solved the challenge on '${chainName}'!`)
      return updateChallengeAndActorStatus(
        _actorsStorage,
        _challengesStorage,
        _challenge,
        constants.hub.challengeStatus.SOLVED,
        constants.hub.actorsStatus.Active
      )
    } else if (formattedMsg.includes(constants.hub.errors.CHALLENGE_UNSOLVED)) {
      logger.warn(`${_challenge.actor} already slashed on '${chainName}'!`)
      return updateChallengeAndActorStatus(
        _actorsStorage,
        _challengesStorage,
        _challenge,
        constants.hub.challengeStatus.UNSOLVED,
        constants.hub.actorsStatus.Inactive
      )
    } else if (formattedMsg.includes(constants.hub.errors.CHALLENGE_CANCELLED)) {
      logger.info(`Challenge has been canceled on ${chainName}, skipping`)
      return updateChallengeStatus(
        _challengesStorage,
        _challenge,
        constants.hub.challengeStatus.CANCELLED
      )
    } else if (formattedMsg.includes(constants.hub.errors.CHALLENGE_NOT_FOUND)) {
      logger.warn(`Challenge not found on '${chainName}' in the current epoch, skipping...`)
      return updateChallengeAndActorStatus(
        _actorsStorage,
        _challengesStorage,
        _challenge,
        constants.hub.challengeStatus.NULL,
        constants.hub.actorsStatus.Active
      )
    } else {
      logger.error('Error description not handled when slashing:')
      logger.error(formattedMsg)
    }
  }
)

module.exports.slashActorErrorHandler = R.curry(
  (resolve, reject, _actorsStorage, _challengesStorage, _supportedChain, _hub, _challenge, _err) =>
    parseEthersErrorOrReject(_hub, _err)
      .then(
        errorDescriptionHandler(_actorsStorage, _challengesStorage, _supportedChain, _challenge)
      )
      .then(resolve)
      .catch(reject)
)
