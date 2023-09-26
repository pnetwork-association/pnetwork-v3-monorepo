const R = require('ramda')
const {
  KEY_ADDRESS,
  KEY_ASSET_NAME,
  KEY_ASSET_SYMBOL,
  KEY_ASSET_DECIMALS,
  KEY_ASSET_TOTAL_SUPPLY,
  KEY_UNDERLYING_ASSET_LIST,
} = require('../constants')
const { types } = require('hardhat/config')
const { TASK_NAME_DEPLOY_INIT } = require('./deploy-init.task')
const { getConfiguration, updateConfiguration } = require('../lib/configuration-manager')

const TASK_PARAM_NAME = 'name'
const TASK_PARAM_SYMBOL = 'symbol'
const TASK_PARAM_DECIMALS = 'decimals'
const TASK_PARAM_TOTAL_SUPPLY = 'totalSupply'
const TASK_NAME_DEPLOY_ASSET = 'deploy:asset'
const TASK_DESC_DEPLOY_ASSET = 'Deploy a pToken or a Token to be used as underlying asset'
const CONTRACT_NAME_STANDARD_TOKEN = 'StandardToken'

const findAssetInUnderlyingAssetList = R.curry(
  (hre, _config, _entry) =>
    new Promise(resolve => {
      const assetList = _config.get(hre.network.name)[KEY_UNDERLYING_ASSET_LIST]

      return resolve(R.find(R.whereEq(_entry), assetList))
    })
)

const createUnderlyingAssetConfigurationEntry = taskArgs =>
  Promise.resolve({
    [KEY_ASSET_NAME]: taskArgs[TASK_PARAM_NAME],
    [KEY_ASSET_SYMBOL]: taskArgs[TASK_PARAM_SYMBOL],
    [KEY_ASSET_DECIMALS]: taskArgs[TASK_PARAM_DECIMALS],
    [KEY_ASSET_TOTAL_SUPPLY]: taskArgs[TASK_PARAM_TOTAL_SUPPLY],
  })

const addNewUnderlyingAssetToConfig = R.curry((taskArgs, hre, _config, _contract) =>
  createUnderlyingAssetConfigurationEntry(taskArgs, _contract)
    .then(R.assoc(KEY_ADDRESS, _contract.address))
    .then(_entry =>
      R.not(
        R.any(
          R.equals(_entry),
          R.defaultTo([], _config.get(hre.network.name)[KEY_UNDERLYING_ASSET_LIST])
        )
      )
        ? updateConfiguration(_config, hre.network.name, KEY_UNDERLYING_ASSET_LIST, _entry)
        : null
    )
    .then(_ => _contract)
)

const deployUnderlyingAsset = (taskArgs, hre, _config) =>
  hre.ethers
    .getContractFactory(CONTRACT_NAME_STANDARD_TOKEN)
    .then(_contractFactory =>
      _contractFactory.deploy(
        taskArgs.name,
        taskArgs.symbol,
        taskArgs.decimals,
        hre.ethers.utils.parseUnits(taskArgs.totalSupply, taskArgs.decimals)
      )
    )
    .then(addNewUnderlyingAssetToConfig(taskArgs, hre, _config))
    .then(_contract => console.info(`New underlying asset deployed @ ${_contract.address}`))

const attachToUnderlyingAsset = R.curry((taskArgs, hre, _assetAddress) =>
  hre.ethers
    .getContractFactory(CONTRACT_NAME_STANDARD_TOKEN)
    .then(_contractFactory => _contractFactory.attach(_assetAddress))
    .then(
      _contract =>
        console.info(`Successfully attached to underlying asset @ ${_assetAddress}`) || _contract
    )
)

const maybeGetAssetFromConfigOrDeploy = R.curry((taskArgs, hre, _config) =>
  createUnderlyingAssetConfigurationEntry(taskArgs)
    .then(findAssetInUnderlyingAssetList(hre, _config))
    .then(_asset =>
      R.isNil(_asset)
        ? deployUnderlyingAsset(taskArgs, hre, _config)
        : attachToUnderlyingAsset(taskArgs, hre, _asset[KEY_ADDRESS])
    )
)

const deployAssetTask = (taskArgs, hre) =>
  hre
    .run(TASK_NAME_DEPLOY_INIT)
    .then(getConfiguration)
    .then(maybeGetAssetFromConfigOrDeploy(taskArgs, hre))

task(TASK_NAME_DEPLOY_ASSET, TASK_DESC_DEPLOY_ASSET, deployAssetTask)
  .addPositionalParam(TASK_PARAM_NAME, 'Token name (i.e. "Token BTC")', undefined, types.string)
  .addPositionalParam(TASK_PARAM_SYMBOL, 'Token symbol (i.e. "BTC")', undefined, types.string)
  .addPositionalParam(TASK_PARAM_DECIMALS, 'Tokens decimals number', undefined, types.string)
  .addPositionalParam(
    TASK_PARAM_TOTAL_SUPPLY,
    'Tokens total supply number',
    undefined,
    types.string
  )

module.exports = {
  attachToUnderlyingAsset,
  addNewUnderlyingAssetToConfig,
  TASK_PARAM_NAME,
  TASK_PARAM_SYMBOL,
  TASK_PARAM_DECIMALS,
  TASK_PARAM_TOTAL_SUPPLY,
}
