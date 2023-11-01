const R = require('ramda')
const ethers = require('ethers')
const { logger } = require('../../get-logger')
const constants = require('ptokens-constants')
const PNetworkHubAbi = require('./abi/PNetworkHub.json')
const { Challenge } = constants.hub
const { updateChallenge } = require('../../update-challenge')
const { generalErrorHandler } = require('./general-error-handler')
const { extractChallengeFromReceipt } = require('./extract-challenge-from-receipt')

module.exports.slashActor = R.curry(
  (_challengesStorage, _privateKey, _supportedChain, _challenge, _dryRun) =>
    new Promise(resolve => {
      const challenge = new Challenge(_challenge)
      logger.info('Slashing actor', challenge.actor)
      const chainName = _supportedChain[constants.config.KEY_CHAIN_NAME]
      const hubAddress = _supportedChain[constants.config.KEY_HUB_ADDRESS]
      const providerUrl = _supportedChain[constants.config.KEY_PROVIDER_URL]
      const provider = new ethers.JsonRpcProvider(providerUrl)
      const wallet = new ethers.Wallet(_privateKey, provider)
      const hub = new ethers.Contract(hubAddress, PNetworkHubAbi, wallet)
      const dryRunPrefix = _dryRun ? ' (dry-run)' : ''

      const challengeArgs = challenge.getArgs()
      logger.debug(`${chainName}: slashByChallenge([${challengeArgs}])${dryRunPrefix}`)

      return _dryRun
        ? hub.slashByChallenge
            .staticCall(challengeArgs)
            .then(resolve)
            .catch(_err =>
              resolve(
                generalErrorHandler(
                  _challengesStorage,
                  challenge.actor,
                  chainName,
                  wallet,
                  hub,
                  _err
                )
              )
            )
        : hub
            .slashByChallenge(challengeArgs)
            .then(_tx => _tx.wait(1))
            .then(_receipt => logger.info(`Tx mined @ ${_receipt.hash}(${chainName})`) || _receipt)
            .then(extractChallengeFromReceipt(hub))
            .then(_ =>
              updateChallenge(
                _challengesStorage,
                challenge.actor,
                challenge.networkId,
                constants.hub.challengeStatus.UNSOLVED
              )
            )
            .then(resolve)
            .catch(_err =>
              resolve(
                generalErrorHandler(
                  _challengesStorage,
                  challenge.actor,
                  _supportedChain,
                  wallet,
                  hub,
                  _err
                )
              )
            )
    })
)
