const R = require('ramda')
const ethers = require('ethers')
const { logger } = require('../../get-logger')
const constants = require('ptokens-constants')
const { db, utils } = require('ptokens-utils')
const PNetworkHubAbi = require('./abi/PNetworkHub.json')
const { Challenge } = constants.hub
const { generalErrorHandler } = require('./general-error-handler')
const dryRunPendingChallenge = require('../../dry-run-pending-challenge')

module.exports.startChallenge = R.curry(
  (
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
        const chainName = _supportedChain[constants.config.KEY_CHAIN_NAME]
        const hubAddress = _supportedChain[constants.config.KEY_HUB_ADDRESS]
        const providerUrl = _supportedChain[constants.config.KEY_PROVIDER_URL]
        const provider = new ethers.JsonRpcProvider(providerUrl)
        const wallet = new ethers.Wallet(_privateKey, provider)
        const hub = new ethers.Contract(hubAddress, PNetworkHubAbi, wallet)

        const dryRunPrefix = _dryRun ? ' (dry-run)' : ''
        logger.debug(`startChallenge(${_actorAddress}, ${_actorType}, [${_proof}])${dryRunPrefix}`)
        return _dryRun
          ? hub.startChallenge
              .staticCall(_actorAddress, _actorType, _proof, { value: _lockAmount })
              .then(_ => db.insertReport(_challengesStorage, dryRunPendingChallenge))
              .then(_ => logger.info('New challenge w/ nonce inserted!'))
              .catch(generalErrorHandler(_actorAddress, wallet, hub))
          : hub
              .startChallenge(_actorAddress, _actorType, _proof, { value: _lockAmount })
              .then(_tx => _tx.wait(1))
              .then(
                _receipt => logger.info(`Tx mined @ ${_receipt.hash}(${chainName})`) || _receipt
              )
              .then(R.path(['logs', 0]))
              .then(_log => hub.interface.parseLog(_log))
              .then(_parsedLog => new Challenge(_parsedLog))
              .then(R.assoc(constants.db.KEY_STATUS, constants.hub.challengeStatus.PENDING))
              .then(db.insertReport(_challengesStorage))
              .catch(generalErrorHandler(_actorAddress, wallet, hub))
      })
)
