const {
  KEY_NETWORK_ID,
  CONTRACT_NAME_PTOKEN,
  TASK_DESC_DEPLOY_PTOKEN,
  TASK_NAME_DEPLOY_PTOKEN,
  TASK_NAME_DEPLOY_ASSET,
  KEY_PROUTER_ADDRESS,
  TASK_NAME_DEPLOY_CONTRACT,
  CONTRACT_NAME_PROUTER,
  KEY_PFACTORY_ADDRESS,
  KEY_STATEMANAGER_ADDRESS,
  CONTRACT_NAME_STATEMANAGER,
} = require('../constants')
const { types } = require('hardhat/config')
const { deployPFactoryTask } = require('./deploy-pfactory.task')
const { getConfiguration } = require('./lib/configuration-manager')
const R = require('ramda')

const deployPTokenTask = ({ name, symbol, decimals, tokenAddress, networkId }, hre) =>
  deployPFactoryTask(null, hre)
    .then(getConfiguration)
    .then(_config => hre.run(TASK_NAME_DEPLOY_CONTRACT, {
      configurableName: KEY_PROUTER_ADDRESS,
      contractFactoryName: CONTRACT_NAME_PROUTER,
      deployArgsArray: [_config.get(hre.network.name)[KEY_PFACTORY_ADDRESS]], }))
    .then(getConfiguration)
    .then(_config => hre.run(TASK_NAME_DEPLOY_CONTRACT, {
      configurableName: KEY_STATEMANAGER_ADDRESS,
      contractFactoryName: CONTRACT_NAME_STATEMANAGER,
      deployArgsArray: [_config.get(hre.network.name)[KEY_PFACTORY_ADDRESS], '120'], // to be parametrized
    }))
    .then(getConfiguration)
    .then(_config =>
      hre.run(TASK_NAME_DEPLOY_ASSET, {
        configurableName: CONTRACT_NAME_PTOKEN,
        contractFactoryName: CONTRACT_NAME_PTOKEN,
        deployArgsArray: [
          name,
          symbol,
          decimals,
          tokenAddress,
          networkId,
          _config.get(hre.network.name)[KEY_PROUTER_ADDRESS],
          _config.get(hre.network.name)[KEY_STATEMANAGER_ADDRESS],
        ],
      })
    )

task(TASK_NAME_DEPLOY_PTOKEN, TASK_DESC_DEPLOY_PTOKEN, deployPTokenTask)
  .addPositionalParam('name', 'Underlying Asset name (i.e. "Token BTC")', undefined, types.string)
  .addPositionalParam('symbol', 'Underlying Asset symbol (i.e. "BTC")', undefined, types.string)
  .addPositionalParam('decimals', 'Underlying Asset decimals number', undefined, types.string)
  .addPositionalParam(
    'tokenAddress',
    'Underlying token asset we want to wrap',
    undefined,
    types.string
  )
  .addPositionalParam('networkId', 'Underlying Asset network ID', undefined, types.string)
