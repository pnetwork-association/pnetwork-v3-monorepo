const R = require('ramda')
const { TASK_NAME_DEPLOY_INIT } = require('../constants')
const {
  getConfiguration,
  maybeAddNewNetwork,
  maybeAddEmptyPTokenList,
  maybeAddEmptyUnderlyingAssetList,
} = require('./lib/configuration-manager')

const TASK_DESC_DEPLOY_INIT =
  'Creates a new deployment configuration or returns the existing one for the selected network.'

const deployInit = (_, hre) =>
  getConfiguration()
    .then(maybeAddNewNetwork(hre))
    .then(maybeAddEmptyPTokenList(hre))
    .then(maybeAddEmptyUnderlyingAssetList(hre))
    .then(R.prop('data'))
    .then(R.prop(hre.network.name))

task(TASK_NAME_DEPLOY_INIT, TASK_DESC_DEPLOY_INIT, deployInit)
