const R = require('ramda')
const ethers = require('ethers')
const { logger } = require('../../get-logger')
const constants = require('ptokens-constants')
const PNetworkHubAbi = require('./abi/PNetworkHub.json')
const { Challenge } = constants.hub
const { updateChallengeStatus } = require('../../update-challenge')
const { getDryRunSuffix } = require('../../get-dry-run-suffix')
const { generalErrorHandler } = require('./general-error-handler')
const { isActorStatusChallenged } = require('../../get-actor-status')
const { slashActorErrorHandler } = require('./slash-actor-error-handler')
const { updateActorStatus } = require('../../update-actor-status')
const { ERROR_DRY_RUN } = require('../../errors')

const slashActorByChallenge = R.curry(
  (_actorsStorage, _challengesStorage, _supportedChain, _hub, _challenge, _dryRun) =>
    new Promise((resolve, reject) => {
      const chainName = _supportedChain[constants.config.KEY_CHAIN_NAME]
      const challengeArgs = _challenge.getArgs()
      logger.debug(`${chainName}: slashByChallenge([${challengeArgs}])${getDryRunSuffix()}`)

      const hubSlashByChallenge = _dryRun ? _hub.slashByChallenge.staticCall : _hub.slashByChallenge

      return hubSlashByChallenge(challengeArgs)
        .then(_tx => (_dryRun ? Promise.reject(ERROR_DRY_RUN) : _tx.wait(1)))
        .then(_receipt => logger.info(`Tx mined @ ${_receipt.hash}(${chainName})`) || _receipt)
        .then(_ =>
          updateChallengeStatus(
            _challengesStorage,
            _challenge,
            constants.hub.challengeStatus.UNSOLVED
          )
        )
        .then(_ =>
          updateActorStatus(
            _actorsStorage,
            constants.hub.actorsStatus.Inactive,
            _challenge.actor,
            _challenge.networkId
          )
        )
        .then(resolve)
        .catch(
          slashActorErrorHandler(
            resolve,
            reject,
            _actorsStorage,
            _challengesStorage,
            _supportedChain,
            _hub,
            _challenge
          )
        )
    })
)

const maybeSlashActorByChallenge = R.curry(
  (_actorsStorage, _challengesStorage, _supportedChain, _hub, _challenge, _dryRun) =>
    isActorStatusChallenged(_actorsStorage, _challenge.actor, _challenge.networkId).then(
      _isChallenged =>
        _isChallenged
          ? slashActorByChallenge(
              _actorsStorage,
              _challengesStorage,
              _supportedChain,
              _hub,
              _challenge,
              _dryRun
            )
          : Promise.resolve()
    )
)

module.exports.slashActor = R.curry(
  (_actorsStorage, _challengesStorage, _privateKey, _supportedChain, _challenge, _dryRun) =>
    new Promise((resolve, reject) => {
      const challenge = new Challenge(_challenge)
      logger.info('Slashing actor', challenge.actor)
      const hubAddress = _supportedChain[constants.config.KEY_HUB_ADDRESS]
      const providerUrl = _supportedChain[constants.config.KEY_PROVIDER_URL]
      const provider = new ethers.JsonRpcProvider(providerUrl)
      const wallet = new ethers.Wallet(_privateKey, provider)
      const hub = new ethers.Contract(hubAddress, PNetworkHubAbi, wallet)

      return maybeSlashActorByChallenge(
        _actorsStorage,
        _challengesStorage,
        _supportedChain,
        hub,
        _challenge,
        _dryRun
      )
        .then(resolve)
        .catch(generalErrorHandler(resolve, reject, _supportedChain, wallet.address))
    })
)
