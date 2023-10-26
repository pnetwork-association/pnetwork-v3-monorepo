const R = require('ramda')
const ethers = require('ethers')
const { logger } = require('../../get-logger')
const constants = require('ptokens-constants')
const PNetworkHubAbi = require('./abi/PNetworkHub.json')
const { Challenge } = constants.hub
const { generalErrorHandler } = require('./general-error-handler')

module.exports.slashActor = R.curry(
  (Memory, _privateKey, _supportedChain, _actorChallenge) =>
    new Promise(_ => {
      logger.info('Slashing actor', _actorChallenge.actor)
      const chainName = _supportedChain[constants.config.KEY_CHAIN_NAME]
      const hubAddress = _supportedChain[constants.config.KEY_HUB_ADDRESS]
      const providerUrl = _supportedChain[constants.config.KEY_PROVIDER_URL]
      const provider = new ethers.JsonRpcProvider(providerUrl)
      const wallet = new ethers.Wallet(_privateKey, provider)
      const dryRun = Memory.isDryRun()
      const hub = new ethers.Contract(hubAddress, PNetworkHubAbi, wallet)
      const dryRunPrefix = dryRun ? ' (dry-run)' : ''

      logger.debug(`${chainName}: slashByChallenge()${dryRunPrefix}`)

      return dryRun
        ? hub.slashByChallenge.staticCall(_actorChallenge.getArg()).catch(generalErrorHandler)
        : hub
            .slashByChallenge(_actorChallenge.getArg())
            .then(_tx => _tx.wait(1))
            .then(_receipt => logger.info(`Tx mined @ ${_receipt.hash}(${chainName})`) || _receipt)
            .then(R.path(['logs', 0]))
            .then(_log => hub.interface.parseLog(_log))
            .then(_parsedLog => new Challenge(_parsedLog))
            .then(_challenge =>
              Memory.changeChallengeStatus(_challenge, constants.hub.challengeStatus.UNSOLVED)
            )
            .catch(generalErrorHandler(wallet))
    })
)
