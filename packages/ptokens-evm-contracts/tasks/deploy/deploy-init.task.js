const R = require('ramda')
const { KEY_PTOKEN_LIST, KEY_UNDERLYING_ASSET_LIST } = require('../constants')
const { getConfiguration, updateConfiguration } = require('./lib/configuration-manager')

const getSelectedChainId = hre => hre.network.config.chainId

const { KEY_NETWORK_ID, TASK_NAME_DEPLOY_INIT, TASK_NAME_GET_NETWORK_ID } = require('../constants')

const TASK_DESC_DEPLOY_INIT =
  'Creates a new deployment configuration or returns the existing one for the selected network.'

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

const deployInit = (_, hre) =>
  getConfiguration()
    .then(maybeAddNewNetwork(hre))
    .then(maybeAddEmptyPTokenList(hre))
    .then(maybeAddEmptyUnderlyingAssetList(hre))
    .then(R.prop('data'))
    .then(R.prop(hre.network.name))

task(TASK_NAME_DEPLOY_INIT, TASK_DESC_DEPLOY_INIT, deployInit)
