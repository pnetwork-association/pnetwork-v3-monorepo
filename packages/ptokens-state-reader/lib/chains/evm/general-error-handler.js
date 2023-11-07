const R = require('ramda')
const ethers = require('ethers')
const { utils } = require('ptokens-utils')
const constants = require('ptokens-constants')
const { logger } = require('../../get-logger')
const { updateChallenge } = require('../../update-challenge')

const errorLog = R.curry((_function, _errKey, _err) => {
  const value = _err[_errKey]
  if (R.isNotNil(value)) {
    _function(value)
  }
})

const logRevert = _reason => {
  logger.error(`Transaction would revert with ${_reason}`)
}
const logInvocation = _invocation => {
  logger.error(`  ${_invocation.method}(${_invocation.args.join(', ')})`)
}

const formatErrorDescription = _parsedError =>
  `${_parsedError.name}(${_parsedError.args.join(', ')})`

const errorDescriptionHandler = (
  _challengeStorage,
  _actorAddress,
  _supportedChain,
  _errDescription
) =>
  new Promise((resolve, _) => {
    const resolvedValue = null
    const chainName = _supportedChain[constants.config.KEY_CHAIN_NAME]
    const networkId = _supportedChain[constants.config.KEY_NETWORK_ID]
    const formattedMsg = formatErrorDescription(_errDescription)
    if (formattedMsg.includes(constants.hub.errors.ACTOR_CHALLENGED)) {
      logger.warn(`${_actorAddress} already challenged on ${chainName}!`)
      return resolve(
        updateChallenge(
          _challengeStorage,
          _actorAddress,
          networkId,
          constants.hub.challengeStatus.PENDING
        )
      )
    } else if (formattedMsg.includes(constants.hub.errors.CHALLENGE_SOLVED)) {
      logger.warn(`${_actorAddress} solved the challenge on ${chainName}!`)
      return resolve(
        updateChallenge(
          _challengeStorage,
          _actorAddress,
          networkId,
          constants.hub.challengeStatus.SOLVED
        )
      )
    } else if (
      formattedMsg.includes(constants.hub.errors.ACTOR_INACTIVE) ||
      formattedMsg.includes(constants.hub.errors.CHALLENGE_UNSOLVED)
    ) {
      logger.warn(`${_actorAddress} already slashed on ${chainName}!`)
      return resolve(
        updateChallenge(
          _challengeStorage,
          _actorAddress,
          networkId,
          constants.hub.challengeStatus.UNSOLVED
        )
      )
    }
    if (formattedMsg.includes('ChallengeNotFound')) {
      logger.warn('Challenge not found in the current epoch, skipping...')
      return resolve(
        updateChallenge(
          _challengeStorage,
          _actorAddress,
          networkId,
          constants.hub.challengeStatus.NULL
        )
      )
    } else {
      logger.warn(formattedMsg)
    }
    return resolve(resolvedValue)
  })

module.exports.generalErrorHandler = R.curry(
  (_challengeStorage, _actorAddress, _supportedChain, _wallet, _contract, _err) =>
    new Promise((resolve, reject) => {
      const msg = _err.message
      const data = _err['data']
      if (utils.isNotNil(data)) {
        const parsedError = _contract.interface.parseError(data)

        return parsedError instanceof ethers.ErrorDescription
          ? resolve(
              errorDescriptionHandler(
                _challengeStorage,
                _actorAddress,
                _supportedChain,
                parsedError
              )
            )
          : logger.debug(_err.message) || resolve(null)
      } else if (msg.includes(constants.evm.ethers.ERROR_EXECUTION_REVERTED)) {
        errorLog(logRevert, 'reason', _err)
        errorLog(logInvocation, 'invocation', _err)
        logger.debug(_err.message)
        return resolve(null)
      }
      if (msg.includes(constants.evm.ethers.ERROR_INSUFFICIENT_FUNDS)) {
        const networkId = _supportedChain[constants.config.KEY_CHAIN_NAME]
        logger.warn(`The account does not have enough funds! (${networkId}) `)
        logger.warn(`  ${_wallet.address}`)
        return resolve(null)
      }

      return reject(_err)
    })
)
