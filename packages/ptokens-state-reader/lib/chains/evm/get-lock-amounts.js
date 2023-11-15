const R = require('ramda')
const ethers = require('ethers')
const constants = require('ptokens-constants')
const { logger } = require('../../get-logger')
const PNetworkHubAbi = require('./abi/PNetworkHub')
const { STATE_LOCK_AMOUNTS_KEY } = require('../../constants')
const { getSupportedChainsFromState } = require('../get-supported-chains')

const getLockAmount = _supportedChain =>
  new Promise((resolve, reject) => {
    const hubAddress = _supportedChain[constants.config.KEY_HUB_ADDRESS]
    const providerUrl = _supportedChain[constants.config.KEY_PROVIDER_URL]
    const networkId = _supportedChain[constants.config.KEY_NETWORK_ID]
    const chainName = _supportedChain[constants.config.KEY_CHAIN_NAME]
    const provider = new ethers.JsonRpcProvider(providerUrl)
    const hub = new ethers.Contract(hubAddress, PNetworkHubAbi, provider)

    return hub
      .lockedAmountStartChallenge()
      .then(
        _lockedAmount =>
          logger.info(`  ${chainName}: ${_lockedAmount}`) || { [networkId]: Number(_lockedAmount) }
      )
      .then(resolve)
      .catch(reject)
  })

const buildLockAmountsObjectPerNetworkId = _supportedChains =>
  logger.info('Getting locked amounts:') ||
  Promise.all(_supportedChains.map(getLockAmount)).then(
    R.reduce((_result, _element) => ({ ..._result, ..._element }), {})
  )

const addLockAmountsObjectToState = R.curry((_state, _lockAmountsObj) =>
  R.assoc(STATE_LOCK_AMOUNTS_KEY, _lockAmountsObj, _state)
)

module.exports.getChallengerLockAmountsAndAddToState = _state =>
  getSupportedChainsFromState(_state)
    .then(buildLockAmountsObjectPerNetworkId)
    .then(addLockAmountsObjectToState(_state))
