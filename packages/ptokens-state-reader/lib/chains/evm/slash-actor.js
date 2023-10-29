const R = require('ramda')
const ethers = require('ethers')
const { logger } = require('../../get-logger')
const constants = require('ptokens-constants')
const PNetworkHubAbi = require('./abi/PNetworkHub.json')
const { Challenge } = constants.hub
const { db } = require('ptokens-utils')
const { generalErrorHandler } = require('./general-error-handler')

const updateChallenge = R.curry((_challengesStorage, _challenge) =>
  db.updateReport(
    _challengesStorage,
    { $set: _challenge },
    { nonce: _challenge.nonce, networkId: _challenge.networkId }
  )
)
module.exports.slashActor = R.curry(
  (_challengesStorage, _privateKey, _supportedChain, _challenge, _dryRun) =>
    new Promise(_ => {
      logger.info('Slashing actor', _challenge.actor)
      const chainName = _supportedChain[constants.config.KEY_CHAIN_NAME]
      const hubAddress = _supportedChain[constants.config.KEY_HUB_ADDRESS]
      const providerUrl = _supportedChain[constants.config.KEY_PROVIDER_URL]
      const provider = new ethers.JsonRpcProvider(providerUrl)
      const wallet = new ethers.Wallet(_privateKey, provider)
      const hub = new ethers.Contract(hubAddress, PNetworkHubAbi, wallet)
      const dryRunPrefix = _dryRun ? ' (dry-run)' : ''

      logger.debug(`${chainName}: slashByChallenge()${dryRunPrefix}`)

      return _dryRun
        ? hub.slashByChallenge
            .staticCall(_challenge.getArg())
            .catch(generalErrorHandler(_challenge.actor, wallet, hub))
        : hub
            .slashByChallenge(_challenge.getArg())
            .then(_tx => _tx.wait(1))
            .then(_receipt => logger.info(`Tx mined @ ${_receipt.hash}(${chainName})`) || _receipt)
            .then(R.path(['logs', 0]))
            .then(_log => hub.interface.parseLog(_log))
            .then(_parsedLog => new Challenge(_parsedLog))
            .then(updateChallenge(_challengesStorage))
            .catch(generalErrorHandler(_challenge.actor, wallet, hub))
    })
)
