const R = require('ramda')
const constants = require('ptokens-constants')
const { logic, utils } = require('ptokens-utils')
const deploymentsJson = require('../../deployments')
const {
  KEY_NETWORK_ID,
  KEY_EPOCHS_MANAGER,
  KEY_ADDRESS,
  KEY_PNETWORKHUB,
  KEY_GOVERNANCE_MESSAGE_EMITTER,
} = require('../constants')
const hhConfig = require('../../hardhat.config')

const buildSupportedChainObject = R.curry(
  (_deploymentsJson, _chainName) =>
    new Promise((resolve, reject) => {
      const chainConfig = _deploymentsJson[_chainName]
      const networkId = chainConfig[KEY_NETWORK_ID]
      const providerUrl = hhConfig.networks[_chainName].url
      const chainType = utils.getBlockchainTypeFromChainIdSync(networkId)
      const hub = _deploymentsJson[_chainName][KEY_PNETWORKHUB][KEY_ADDRESS]
      const epochManager = R.path([_chainName, KEY_EPOCHS_MANAGER, KEY_ADDRESS], _deploymentsJson)
      const governanceMessageEmitter = R.path(
        [_chainName, KEY_GOVERNANCE_MESSAGE_EMITTER, KEY_ADDRESS],
        _deploymentsJson
      )

      if (R.isNil(providerUrl)) {
        return reject(new Error('Unable to find network in hardhat.config.js', _chainName))
      }

      const obj = {
        [constants.config.KEY_HUB_ADDRESS]: hub,
        [constants.config.KEY_NETWORK_ID]: networkId,
        [constants.config.KEY_CHAIN_NAME]: _chainName,
        [constants.config.KEY_CHAIN_TYPE]: chainType,
        [constants.config.KEY_PROVIDER_URL]: providerUrl,
      }

      return _chainName === constants.interim.name
        ? resolve({
            ...obj,
            [constants.config.KEY_EPOCHS_MANAGER_ADDRESS]: epochManager,
            [constants.config.KEY_GOVERNANCE_MESSAGE_EMITTER_ADDRESS]: governanceMessageEmitter,
          })
        : resolve(obj)
    })
)

module.exports.addSupportedChains = _obj =>
  Promise.resolve(Object.keys(deploymentsJson))
    .then(logic.mapAll(buildSupportedChainObject(deploymentsJson)))
    .then(_supportedChains =>
      R.assoc(constants.config.KEY_SUPPORTED_CHAINS, _supportedChains, _obj)
    )
