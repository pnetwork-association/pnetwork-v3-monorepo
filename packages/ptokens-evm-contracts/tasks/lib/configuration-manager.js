const R = require('ramda')
const Store = require('data-store')
const PATH_CONFIG_FILE = '/deployments.json'
const {
  KEY_ADDRESS,
  KEY_NETWORK_ID,
  KEY_PTOKEN_LIST,
  KEY_PNETWORKHUB,
  KEY_UNDERLYING_ASSET_LIST,
  KEY_GOVERNANCE_MESSAGE_EMITTER,
  KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS,
} = require('../constants')
const { utils } = require('ptokens-utils')
const { TASK_NAME_GET_NETWORK_ID } = require('../get-network-id')

const getConfiguration = () => Promise.resolve(Store({ path: process.cwd() + PATH_CONFIG_FILE }))

const PROPERTIES_REQUIRING_UNION = [KEY_PTOKEN_LIST, KEY_UNDERLYING_ASSET_LIST]

const getSelectedChainId = hre => hre.network.config.chainId

const addNewNetwork = (hre, _config) =>
  hre
    .run(TASK_NAME_GET_NETWORK_ID, {
      quiet: true,
      chainId: getSelectedChainId(hre),
    })
    .then(_networkId => updateConfiguration(_config, hre.network.name, KEY_NETWORK_ID, _networkId))

const maybeAddNewNetwork = R.curry((hre, _config) =>
  !_config.has(hre.network.name) ? addNewNetwork(hre, _config) : Promise.resolve(_config)
)

const maybeAddEmptyUnderlyingAssetList = R.curry((hre, _config) =>
  _config.union(`${hre.network.name}.${KEY_UNDERLYING_ASSET_LIST}`, [])
)

const maybeAddEmptyPTokenList = R.curry((hre, _config) =>
  _config.union(`${hre.network.name}.${KEY_PTOKEN_LIST}`, [])
)

const updateConfiguration = (...vargs) =>
  new Promise(resolve => {
    const config = vargs.at(0)
    const valueArgIndex = -1
    const typeArgIndex = -2
    const value = vargs.at(valueArgIndex)
    const args = R.slice(1, valueArgIndex, vargs)
    const propertyChangingValue = vargs.at(typeArgIndex)
    const path = args.reduce((acc, cur) => acc + '.' + cur)

    if (R.includes(propertyChangingValue, PROPERTIES_REQUIRING_UNION)) config.union(path, value)
    else config.set(path, value)

    return resolve(config)
  })

const getDeploymentFromHRE = hre =>
  getConfiguration().then(_config => _config.get(hre.network.name))

const getHubAddress = hre => getDeploymentFromHRE(hre).then(R.path([KEY_PNETWORKHUB, KEY_ADDRESS]))

const getNetworkId = hre => getDeploymentFromHRE(hre).then(R.prop(KEY_NETWORK_ID))

const getNetworkIdFromChainName = _networkName =>
  getConfiguration()
    .then(_config => _config.get(_networkName))
    .then(R.prop(KEY_NETWORK_ID))

const getGovernanceMessageEmitterAddress = hre =>
  getDeploymentFromHRE(hre).then(R.path([KEY_GOVERNANCE_MESSAGE_EMITTER, KEY_ADDRESS]))

const checkHubIsDeployed = hre =>
  getHubAddress(hre).then(
    utils.promises.rejectIfNil(
      `Could not find any PNetworkHub address for '${hre.network.name}', have you deployed it?`
    )
  )

const getPTokenEntryFromPTokenAddress = (hre, _address) =>
  getDeploymentFromHRE(hre)
    .then(R.prop(KEY_PTOKEN_LIST))
    .then(R.find(R.compose(R.equals(R.toLower(_address)), R.toLower, R.prop(KEY_ADDRESS))))
    .then(utils.rejectIfNil(`Unable to find a suitable pToken for '${hre.network.name}'`))

const getPTokenEntryFromUnderlyingAssetAddress = (hre, _underlyingAssetAddress) =>
  getDeploymentFromHRE(hre)
    .then(R.prop(KEY_PTOKEN_LIST))
    .then(
      R.find(
        R.compose(
          R.equals(R.toLower(_underlyingAssetAddress)),
          R.toLower,
          R.prop(KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS)
        )
      )
    )
    .then(utils.rejectIfNil(`Underlying asset not found: '${_underlyingAssetAddress}'`))

module.exports = {
  getNetworkId,
  getConfiguration,
  maybeAddNewNetwork,
  updateConfiguration,
  getDeploymentFromHRE,
  getHubAddress,
  maybeAddEmptyPTokenList,
  getNetworkIdFromChainName,
  checkHubIsDeployed,
  maybeAddEmptyUnderlyingAssetList,
  getGovernanceMessageEmitterAddress,
  getPTokenEntryFromPTokenAddress,
  getPTokenEntryFromUnderlyingAssetAddress,
}
