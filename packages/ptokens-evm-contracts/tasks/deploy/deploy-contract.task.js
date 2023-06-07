const { TASK_NAME_DEPLOY_INIT, TASK_NAME_DEPLOY_CONTRACT, KEY_ADDRESS } = require('../constants')
const { utils } = require('ptokens-utils')
const { types } = require('hardhat/config')
const { attachToContract, deployContractErrorHandler } = require('./lib/utils-contracts')

const TASK_DESC_DEPLOY_CONTRACT = 'Deploy a contract.'

const deployContractTask = (taskArgs, hre) =>
  hre
    .run(TASK_NAME_DEPLOY_INIT)
    .then(utils.getKeyFromObjThroughPath([taskArgs.configurableName, KEY_ADDRESS]))
    .then(attachToContract(hre, taskArgs))
    .catch(deployContractErrorHandler(hre, taskArgs))

subtask(TASK_NAME_DEPLOY_CONTRACT, TASK_DESC_DEPLOY_CONTRACT)
  .addParam(
    'configurableName',
    'Configuration property where the address will be stored',
    undefined,
    types.string
  )
  .addParam('contractFactoryName', 'Contract factory name (i.e. PFactory)', undefined, types.string)
  .addVariadicPositionalParam(
    'deployArgsArray',
    'Contract constructor arguments array',
    [],
    types.json
  )
  .setAction(deployContractTask)
