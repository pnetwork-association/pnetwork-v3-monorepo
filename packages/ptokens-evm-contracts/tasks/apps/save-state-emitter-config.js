const R = require('ramda')
const path = require('path')
const { logic, utils } = require('ptokens-utils')
const constants = require('ptokens-constants')
const deploymentsJson = require('../../deployments')
const { KEY_NETWORK_ID } = require('../constants')
const hhConfig = require('../../hardhat.config')
const { maybeSaveConfiguration } = require('./save-configuration')

const PATH_TO_GUARDIAN_APP = path.join(__dirname, '../../../../apps/ptokens-guardian')

const buildSupportedChainObject = R.curry(
  (_deploymentsJson, _chainName) =>
    new Promise((resolve, reject) => {
      const chainConfig = _deploymentsJson[_chainName]
      const networkId = chainConfig[KEY_NETWORK_ID]
      const providerUrl = hhConfig.networks[_chainName].url
      const chainType = utils.getBlockchainTypeFromChainIdSync(networkId)

      if (R.isNil(providerUrl)) {
        return reject(new Error('Unable to find network in hardhat.config.js', _chainName))
      }

      return resolve({
        [constants.config.KEY_NETWORK_ID]: networkId,
        [constants.config.KEY_CHAIN_NAME]: _chainName,
        [constants.config.KEY_CHAIN_TYPE]: chainType,
        [constants.config.KEY_PROVIDER_URL]: providerUrl,
      })
    })
)

const addSupportedChains = _obj =>
  Promise.resolve(Object.keys(deploymentsJson))
    .then(logic.mapAll(buildSupportedChainObject(deploymentsJson)))
    .then(_supportedChains =>
      R.assoc(constants.config.KEY_SUPPORTED_CHAINS, _supportedChains, _obj)
    )

const addProtocols = _obj =>
  Promise.resolve({
    ..._obj,
    [constants.config.KEY_PROTOCOLS]: {
      [constants.config.KEY_CHAIN_TYPE]: 'ipfs',
      [constants.config.KEY_DATA]: { topic: 'pnetwork-v3' },
    },
  })

const addIdentity = _obj =>
  Promise.resolve({
    ..._obj,
    [constants.config.KEY_IDENTITY_GPG]: './private-key.gpg',
  })

const addInterval = _obj =>
  Promise.resolve({
    ..._obj,
    [constants.config.KEY_INTERVAL]: 30000,
  })

module.exports.saveStateEmitterConfiguration = (_taskArgs, _hre) =>
  Promise.resolve({})
    .then(addSupportedChains)
    .then(addProtocols)
    .then(addIdentity)
    .then(addInterval)
    .then(
      maybeSaveConfiguration(
        _taskArgs,
        'State emitter configuration',
        `${PATH_TO_GUARDIAN_APP}/state-emitter.config.json`
      )
    )
