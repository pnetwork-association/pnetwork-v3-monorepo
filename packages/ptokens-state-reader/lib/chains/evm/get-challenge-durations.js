const R = require('ramda')
const ethers = require('ethers')
const constants = require('ptokens-constants')
const { STATE_CHALLENGE_DURATIONS_KEY } = require('../../constants')
const PNetworkHubAbi = require('./abi/PNetworkHub.json')
const { logger } = require('../../get-logger')

const getDurationForEachSupportedChain = R.curry((_supportedChains, _hubs) =>
  Promise.all(
    _supportedChains.map((_supportedChain, _index) => {
      const chainName = _supportedChain[constants.config.KEY_CHAIN_NAME]
      const networkId = _supportedChain[constants.config.KEY_NETWORK_ID]
      return _hubs[_index]
        .challengeDuration()
        .then(
          _duration =>
            logger.info(`  ${chainName}: ${_duration}s`) || { [networkId]: Number(_duration) }
        )
    })
  )
)

const buildDurationsObject = _array =>
  Promise.resolve(
    _array.reduce(
      (_result, _elem) => ({
        ..._result,
        ..._elem,
      }),
      {}
    )
  )

const addDurationsObjectToState = R.curry((_state, _durationObj) =>
  R.assoc(STATE_CHALLENGE_DURATIONS_KEY, _durationObj, _state)
)

module.exports.getChallengeDurationsAndAddToState = _state =>
  new Promise((resolve, reject) => {
    const supportedChains = _state[constants.config.KEY_SUPPORTED_CHAINS]
    const providersUrls = supportedChains.map(R.prop(constants.config.KEY_PROVIDER_URL))
    const providers = providersUrls.map(_url => new ethers.JsonRpcProvider(_url))
    const hubsAddresses = supportedChains.map(R.prop(constants.config.KEY_HUB_ADDRESS))
    const hubs = hubsAddresses.map(
      (_address, _index) => new ethers.Contract(_address, PNetworkHubAbi, providers[_index])
    )

    logger.info('Getting challenge durations:')
    return getDurationForEachSupportedChain(supportedChains, hubs)
      .then(buildDurationsObject)
      .then(addDurationsObjectToState(_state))
      .then(resolve)
      .catch(reject)
  })
