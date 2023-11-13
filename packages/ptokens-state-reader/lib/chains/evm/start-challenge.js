const R = require('ramda')
const ethers = require('ethers')
const { logger } = require('../../get-logger')
const constants = require('ptokens-constants')
const { utils } = require('ptokens-utils')
const PNetworkHubAbi = require('./abi/PNetworkHub.json')
const { getDryRunSuffix } = require('../../ger-dry-run-suffix')
const { isActorStatusActive } = require('../../get-actor-status')
const { generalErrorHandler } = require('./general-error-handler')
const { insertChallengePending } = require('../../insert-challenge')
const { startChallengeErrorHandler } = require('./start-challenger-error-handler')
const { extractChallengeFromReceipt } = require('./extract-challenge-from-receipt')

const challengeActor = R.curry(
  (
    _actorsStorage,
    _challengesStorage,
    _supportedChain,
    _hub,
    _actorAddress,
    _actorType,
    _proof,
    _lockAmount,
    _dryRun
  ) =>
    new Promise((resolve, reject) => {
      const chainName = _supportedChain[constants.config.KEY_CHAIN_NAME]
      logger.debug(
        `${chainName}: startChallenge(${_actorAddress}, ${_actorType}, [${_proof}])${getDryRunSuffix(
          _dryRun
        )}`
      )

      const hubStartChallenge = _dryRun ? _hub.startChallenge.staticCall : _hub.startChallenge

      return hubStartChallenge(_actorAddress, _actorType, _proof, { value: _lockAmount })
        .then(_tx => (_dryRun ? Promise.resolve() : _tx.wait(1)))
        .then(_receipt => logger.info(`Tx mined @ ${_receipt.hash}(${chainName})`) || _receipt)
        .then(extractChallengeFromReceipt(_hub))
        .then(insertChallengePending(_challengesStorage))
        .then(resolve)
        .catch(
          startChallengeErrorHandler(
            resolve,
            reject,
            _actorsStorage,
            _challengesStorage,
            _hub,
            _actorAddress,
            _supportedChain
          )
        )
    })
)

const maybeChallengeActor = R.curry(
  (
    _actorsStorage,
    _challengesStorage,
    _supportedChain,
    _hub,
    _actorAddress,
    _actorType,
    _proof,
    _lockAmount,
    _dryRun
  ) =>
    isActorStatusActive(_actorsStorage, _actorAddress).then(_isActive =>
      _isActive
        ? challengeActor(
            _actorsStorage,
            _challengesStorage,
            _supportedChain,
            _hub,
            _actorAddress,
            _actorType,
            _proof,
            _lockAmount,
            _dryRun
          )
        : Promise.resolve()
    )
)

module.exports.startChallenge = R.curry(
  (
    _actorsStorage,
    _challengesStorage,
    _supportedChain,
    _privateKey,
    _lockAmount,
    _actorAddress,
    _actorType,
    _proof,
    _networkId,
    _dryRun
  ) =>
    utils
      .getBlockchainTypeFromChainId(_networkId)
      .then(utils.rejectIfNotEqual(constants.blockchainType.EVM))
      .then(_ => {
        const hubAddress = _supportedChain[constants.config.KEY_HUB_ADDRESS]
        const providerUrl = _supportedChain[constants.config.KEY_PROVIDER_URL]
        const provider = new ethers.JsonRpcProvider(providerUrl)
        const wallet = new ethers.Wallet(_privateKey, provider)
        const hub = new ethers.Contract(hubAddress, PNetworkHubAbi, wallet)

        return maybeChallengeActor(
          _actorsStorage,
          _challengesStorage,
          _supportedChain,
          hub,
          _actorAddress,
          _actorType,
          _proof,
          _lockAmount,
          _dryRun
        ).catch(
          generalErrorHandler(Promise.resolve, Promise.reject, _supportedChain, wallet.address)
        )
      })
)
