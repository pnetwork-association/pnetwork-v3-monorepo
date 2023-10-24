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

    logger.info(`Getting challenger locked amount for '${chainName}'...`)
    return hub
      .lockedAmountStartChallenge()
      .then(_lockedAmount => ({ [networkId]: _lockedAmount }))
      .then(resolve)
      .catch(reject)
  })

const buildLockAmountsObjectPerNetworkId = _supportedChains =>
  logger.info('Building locked amounts object...') ||
  Promise.all(_supportedChains.map(getLockAmount)).then(
    _array =>
      logger.info('Locked amounts successfully retrieved, polishing...') ||
      _array.reduce(
        (_lockAmountsObject, _element) => ({
          ..._lockAmountsObject,
          ..._element,
        }),
        {}
      )
  )

const addLockAmountsObjectToState = R.curry((_state, _lockAmountsObj) =>
  R.assoc(STATE_LOCK_AMOUNTS_KEY, _lockAmountsObj, _state)
)

module.exports.getChallengerLockAmountsAndAddToState = _state =>
  getSupportedChainsFromState(_state)
    .then(buildLockAmountsObjectPerNetworkId)
    .then(addLockAmountsObjectToState(_state))
