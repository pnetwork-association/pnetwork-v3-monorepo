const {
  KEY_NETWORK_ID,
  KEY_TEST_TOKEN_ADDRESS,
  CONTRACT_NAME_TEST_TOKEN,
  TASK_DESC_DEPLOY_TEST_TOKEN,
  TASK_NAME_DEPLOY_TEST_TOKEN,
  TASK_NAME_DEPLOY_CONTRACT,
} = require('../constants')
const { types } = require('hardhat/config')
const { deployPFactoryTask } = require('./deploy-pfactory.task')
const { getConfiguration } = require('./lib/configuration-manager')

const deployERC20TokenTask = ({ name, symbol, decimals, totalSupply }, hre) =>
  deployPFactoryTask(null, hre)
  // Leave it as a second step as the configuration may not be ready yet
  .then(_pFactory => Promise.all([ _pFactory, getConfiguration() ]))
  .then(([_pFactory, _config]) =>
    hre.run(TASK_NAME_DEPLOY_CONTRACT, {
      configurableName: KEY_TEST_TOKEN_ADDRESS,
      contractFactoryName: CONTRACT_NAME_TEST_TOKEN,
      deployArgsArray: [name, symbol, decimals, totalSupply],
    })
  )

task(TASK_NAME_DEPLOY_TEST_TOKEN, TASK_DESC_DEPLOY_TEST_TOKEN, deployERC20TokenTask)
  .addPositionalParam('name', 'Token name (i.e. "Token BTC"', undefined, types.string)
  .addPositionalParam('symbol', 'Token symbol (i.e. "BTC"', undefined, types.string)
  .addPositionalParam('decimals', 'Tokens decimals number', undefined, types.string)
  .addPositionalParam('totalSupply', 'Tokens total supply number', undefined, types.string)