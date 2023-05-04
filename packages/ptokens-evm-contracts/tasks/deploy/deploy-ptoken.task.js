const {
  KEY_NETWORK_ID,
  KEY_PTOKEN_ADDRESS,
  CONTRACT_NAME_PTOKEN,
  TASK_DESC_DEPLOY_PTOKEN,
  TASK_NAME_DEPLOY_PTOKEN,
  TASK_NAME_DEPLOY_ASSET,
} = require('../constants')
const { types } = require('hardhat/config')
const { deployPFactoryTask } = require('./deploy-pfactory.task')
const { deployPRouterTask } = require('./deploy-prouter.task')
const { deployStateManagerTask } = require('./deploy-state-manager.task')
const { getConfiguration } = require('./lib/configuration-manager')
const R = require('ramda')
const { execAndPass } = require('./utils/utils-contracts')

const deployPTokenTask = ({ name, symbol, decimals, tokenAddress }, hre) =>
  deployPFactoryTask(null, hre)
    .then(execAndPass(deployPRouterTask, [null, hre]))
    .then(execAndPass(deployStateManagerTask, [null, hre]))
    .then(execAndPass(getConfiguration, []))
    .then(([_pFactory, _pRouter, _stateManager, _config]) =>
      hre.run(TASK_NAME_DEPLOY_ASSET, {
        configurableName: KEY_PTOKEN_ADDRESS,
        contractFactoryName: CONTRACT_NAME_PTOKEN,
        underlyingAsset: tokenAddress,
        deployArgsArray: [
          name,
          symbol,
          decimals,
          tokenAddress,
          _config.get(hre.network.name)[KEY_NETWORK_ID],
          _pRouter.address,
          _stateManager.address,
        ],
      })
    )

task(TASK_NAME_DEPLOY_PTOKEN, TASK_DESC_DEPLOY_PTOKEN, deployPTokenTask)
  .addPositionalParam('name', 'underlying Asset name (i.e. "Token BTC"', undefined, types.string)
  .addPositionalParam('symbol', 'underlying Asset symbol (i.e. "BTC"', undefined, types.string)
  .addPositionalParam('decimals', 'underlying Asset decimals number', undefined, types.string)
  .addPositionalParam(
    'tokenAddress',
    'Underlying token asset we want to wrap',
    undefined,
    types.string
  )
