const R = require('ramda')
const ethers = require('ethers')
const { logger } = require('../../get-logger')
const constants = require('ptokens-constants')
const { utils } = require('ptokens-utils')
const PNetworkHubAbi = require('./abi/PNetworkHub.json')
const { generalErrorHandler } = require('./general-error-handler')
const { insertChallengePending } = require('../../insert-challenge')
const { extractChallengeFromReceipt } = require('./extract-challenge-from-receipt')

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
        logger.debug(
          `${chainName}: startChallenge(${_actorAddress}, ${_actorType}, [${_proof}])${dryRunPrefix}`
        )
        return _dryRun
          ? hub.startChallenge
              .staticCall(_actorAddress, _actorType, _proof, { value: _lockAmount })
              .catch(generalErrorHandler(_actorAddress, chainName, wallet, hub))
          : hub
              .startChallenge(_actorAddress, _actorType, _proof, { value: _lockAmount })
              .then(_tx => _tx.wait(1))
              .then(
                _receipt => logger.info(`Tx mined @ ${_receipt.hash}(${chainName})`) || _receipt
              )
              .then(extractChallengeFromReceipt(hub))
              .then(insertChallengePending(_challengesStorage))
              .catch(generalErrorHandler(_actorAddress, chainName, wallet, hub))
      })
)
