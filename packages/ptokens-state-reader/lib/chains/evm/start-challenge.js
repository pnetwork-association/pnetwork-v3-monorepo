const R = require('ramda')
const ethers = require('ethers')
const { logger } = require('../../get-logger')
const constants = require('ptokens-constants')
const { utils } = require('ptokens-utils')
const PNetworkHubAbi = require('./abi/PNetworkHub.json')
const { findSupportedChain } = require('../../find-supported-chain')
const { Challenge } = constants.hub
const { ERROR_ACTOR_NOT_PROPAGATED } = require('../../errors')
const { generalErrorHandler } = require('./general-error-handler')

module.exports.startChallenge = R.curry(
  (Memory, _privateKey, _supportedChains, _lockAmount, _address, _proof, _networkId) =>
    utils
      .getBlockchainTypeFromChainId(_networkId)
      .then(utils.rejectIfNotEqual(constants.blockchainType.EVM))
      .then(_ => {
        const supportedChain = findSupportedChain(_supportedChains, _networkId)
        const chainName = supportedChain[constants.config.KEY_CHAIN_NAME]
        const hubAddress = supportedChain[constants.config.KEY_HUB_ADDRESS]
        const providerUrl = supportedChain[constants.config.KEY_PROVIDER_URL]
        const provider = new ethers.JsonRpcProvider(providerUrl)
        const wallet = new ethers.Wallet(_privateKey, provider)
        const hub = new ethers.Contract(hubAddress, PNetworkHubAbi, wallet)
        const dryRun = Memory.isDryRun()
        const actorType = Memory.getActorType(_address)

        if (R.isNil(actorType))
          return Promise.reject(new Error(`${ERROR_ACTOR_NOT_PROPAGATED} (${_address})`))

        const dryRunPrefix = dryRun ? ' (dry-run)' : ''
        logger.debug(
          `${chainName}: startChallenge(${_address.slice(0, 10)}..., ${actorType}, ${_proof.map(
            R.slice(0, 10)
          )}...)${dryRunPrefix}`
        )
        return dryRun
          ? hub.startChallenge
              .staticCall(_address, actorType, _proof, { value: _lockAmount })
              .catch(generalErrorHandler)
          : hub
              .startChallenge(_address, actorType, _proof, { value: _lockAmount })
              .then(_tx => _tx.wait(1))
              .then(
                _receipt => logger.info(`Tx mined @ ${_receipt.hash}(${chainName})`) || _receipt
              )
              .then(R.path(['logs', 0]))
              .then(_log => hub.interface.parseLog(_log))
              .then(_parsedLog => new Challenge(_parsedLog))
              .then(_challenge => Memory.addPendingChallenge(_challenge))
              .catch(generalErrorHandler(wallet))
      })
)
