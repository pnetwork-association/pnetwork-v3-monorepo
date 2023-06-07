const R = require('ramda')
const Store = require('data-store')
const PATH_CONFIG_FILE = '/deployments.json'
const {
  KEY_PTOKEN_LIST,
  KEY_UNDERLYING_ASSET_LIST,
  KEY_NETWORK_ID,
  TASK_NAME_GET_NETWORK_ID,
} = require('../../constants')

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

module.exports = {
  getConfiguration,
  updateConfiguration,
  maybeAddNewNetwork,
  maybeAddEmptyUnderlyingAssetList,
  maybeAddEmptyPTokenList,
}
