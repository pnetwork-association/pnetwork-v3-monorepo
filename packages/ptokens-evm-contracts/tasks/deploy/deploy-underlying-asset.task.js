const {
  CONTRACT_NAME_UNDERLYING_ASSET,
  KEY_UNDERLYING_ASSET_LIST,
  TASK_DESC_DEPLOY_UNDERLYING_ASSET,
  TASK_NAME_DEPLOY_UNDERLYING_ASSET,
  TASK_NAME_DEPLOY_ASSET,
} = require('../constants')
const { types } = require('hardhat/config')
const { deployPFactoryTask } = require('./deploy-pfactory.task')
const { getConfiguration } = require('./lib/configuration-manager')

const deployUnderlyingAssetTask = ({ name, symbol, decimals, totalSupply }, hre) =>
  console.log(hre.ethers.utils.parseEther(totalSupply)) ||
  deployPFactoryTask(null, hre)
    // Leave it as a second step as the configuration may not be ready yet
    .then(_pFactory => Promise.all([_pFactory, getConfiguration()]))
    .then(([_pFactory, _config]) =>
      hre.run(TASK_NAME_DEPLOY_ASSET, {
        configurableName: KEY_UNDERLYING_ASSET_LIST,
        contractFactoryName: CONTRACT_NAME_UNDERLYING_ASSET,
        underlyingAsset: 'not-used',
        deployArgsArray: [name, symbol, decimals, totalSupply],
      })
    )

task(TASK_NAME_DEPLOY_UNDERLYING_ASSET, TASK_DESC_DEPLOY_UNDERLYING_ASSET, deployUnderlyingAssetTask)
  .addPositionalParam('name', 'Token name (i.e. "Token BTC")', undefined, types.string)
  .addPositionalParam('symbol', 'Token symbol (i.e. "BTC")', undefined, types.string)
  .addPositionalParam('decimals', 'Tokens decimals number', undefined, types.string)
  .addPositionalParam('totalSupply', 'Tokens total supply number', undefined, types.string)

module.exports = {
  deployUnderlyingAssetTask,
}
