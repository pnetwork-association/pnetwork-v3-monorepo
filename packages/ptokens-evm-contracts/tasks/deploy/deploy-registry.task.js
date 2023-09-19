const { types } = require('hardhat/config')

const TASK_CONSTANTS = require('../constants')
const { TASK_NAME_DEPLOY_CONTRACT } = require('../deploy/deploy-contract.task')

const TASK_NAME_DEPLOY_REGISTRY = 'deploy:registry'
const TASK_DESC_DEPLOY_REGISTRY =
  'Deploy the PRegistry contract or returns the existing address defined in the configuration.'

const deployPRegistryTask = (_args, hre) =>
  console.info('Deploying PRegistry ...') ||
  hre.run(TASK_NAME_DEPLOY_CONTRACT, {
    configurableName: TASK_CONSTANTS.KEY_PREGISTRY,
    contractFactoryName: TASK_CONSTANTS.CONTRACT_NAME_REGISTRY,
    deployArgsArray: [_args[TASK_CONSTANTS.PARAM_NAME_DANDELION_VOTING_ADDRESS]],
  })

task(TASK_NAME_DEPLOY_REGISTRY, TASK_DESC_DEPLOY_REGISTRY, deployPRegistryTask).addPositionalParam(
  TASK_CONSTANTS.PARAM_NAME_DANDELION_VOTING_ADDRESS,
  TASK_CONSTANTS.PARAM_DESC_DANDELION_VOTING_ADDRESS,
  undefined,
  types.string
)

module.exports = {
  deployPRegistryTask,
}
