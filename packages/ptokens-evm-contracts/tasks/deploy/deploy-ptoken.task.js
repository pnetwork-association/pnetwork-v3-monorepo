const {
  KEY_NETWORK_ID,
  KEY_PTOKEN_ADDRESS,
  CONTRACT_NAME_PTOKEN,
  TASK_DESC_DEPLOY_PTOKEN,
  TASK_NAME_DEPLOY_PTOKEN,
  TASK_NAME_DEPLOY_CONTRACT,
} = require('../constants')
const { types } = require('hardhat/config')
const { deployPFactoryTask } = require('./deploy-pfactory.task')
const { getConfiguration } = require('./lib/configuration-manager')

const deployPTokenTask = ({ name, symbol, decimals, tokenAddress }, hre) =>
  deployPFactoryTask(null, hre)
  // Leave it as a second step as the configuration may not be ready yet
  .then(_pFactory => Promise.all([ _pFactory, getConfiguration() ])
  .then(([_pFactory, _config]) =>
    hre.run(TASK_NAME_DEPLOY_CONTRACT, {
      configurableName: KEY_PTOKEN_ADDRESS,
      contractFactoryName: CONTRACT_NAME_PTOKEN,
      deployArgsArray: [name, symbol, decimals, tokenAddress, _config[KEY_NETWORK_ID]],
    })
  )

task(TASK_NAME_DEPLOY_PTOKEN, TASK_DESC_DEPLOY_PTOKEN, deployPTokenTask)
  .addPositionalParam('name', 'pToken name (i.e. "pToken BTC"', undefined, types.string)
  .addPositionalParam('symbol', 'pToken symbol (i.e. "pBTC"', undefined, types.string)
  .addPositionalParam('decimals', 'pTokens decimals number', 18, types.int)
  .addPositionalParam('tokenAddress', 'Underlying token asset we want to wrap', undefined, types.int)
