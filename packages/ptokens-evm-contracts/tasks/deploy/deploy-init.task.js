const R = require('ramda')
const fs = require('fs/promises')
const { utils, errors } = require('ptokens-utils')
const {
  getConfiguration,
  updateConfiguration,
} = require('./lib/configuration-manager')

const getSelectedChainId = hre => hre.network.config.chainId
const {
  KEY_NETWORK_ID,
  TASK_DESC_DEPLOY_INIT,
  TASK_NAME_DEPLOY_INIT,
  TASK_NAME_GET_NETWORK_ID,
}  = require('../constants')

const addNewNetwork = (hre, _config) =>
  hre
    .run(TASK_NAME_GET_NETWORK_ID, {
      quiet: true,
      chainId: getSelectedChainId(hre),
    })
    .then(_networkId => updateConfiguration(_config, hre.network.name, KEY_NETWORK_ID, _networkId))

const maybeAddNewNetwork = R.curry((hre, _config) =>
  !_config.has(hre.network.name)
    ? addNewNetwork(hre, _config)
    : console.info(`Already found a configuration for '${hre.network.name}'`) ||
      Promise.resolve(_config)
)

const deployInit = (_, hre) =>
  getConfiguration().then(maybeAddNewNetwork(hre))
    .then(R.prop('data'))
    .then(R.prop(hre.network.name))
    .then(_json => console.log(`Configuration for '${hre.network.name}'\n`, _json) || _json)


task(TASK_NAME_DEPLOY_INIT, TASK_DESC_DEPLOY_INIT, deployInit)