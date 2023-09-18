const { types } = require('hardhat/config')

const { KEY_SLASHER, CONTRACT_NAME_SLASHER } = require('../constants')
const { TASK_NAME_DEPLOY_CONTRACT } = require('../deploy/deploy-contract.task')

const TASK_NAME_DEPLOY_SLASHER = 'deploy:slasher'
const TASK_DESC_DEPLOY_SLASHER =
  'Deploy the slasher contract or returns the existing address defined in the configuration.'
const TASK_PARAM_NAME_PREGISTRY_ADDRESS = 'pRegistryAddress'
const TASK_PARAM_DESC_PREGISTRY_ADDRESS = 'PRegistry contract address'
const TASK_PARAM_NAME_REGISTRATION_MANAGER_ADDRESS = 'registrationManagerAddress'
const TASK_PARAM_DESC_REGISTRATION_MANAGER_ADDRESS = 'Registration Manager contract address'
const TASK_PARAM_NAME_AMOUNT_TO_SLASH = 'amountToSlash'
const TASK_PARAM_DESC_AMOUNT_TO_SLASH = 'Staking sentinel amount to slash'

const deploySlasherTask = (_args, hre) =>
  console.info('Deploying slasher ...') ||
  hre.run(TASK_NAME_DEPLOY_CONTRACT, {
    configurableName: KEY_SLASHER,
    contractFactoryName: CONTRACT_NAME_SLASHER,
    deployArgsArray: [
      _args[TASK_PARAM_NAME_PREGISTRY_ADDRESS],
      _args[TASK_PARAM_NAME_REGISTRATION_MANAGER_ADDRESS],
      _args[TASK_PARAM_NAME_AMOUNT_TO_SLASH],
    ],
  })

task(TASK_NAME_DEPLOY_SLASHER, TASK_DESC_DEPLOY_SLASHER, deploySlasherTask)
  .addPositionalParam(
    TASK_PARAM_NAME_PREGISTRY_ADDRESS,
    TASK_PARAM_DESC_PREGISTRY_ADDRESS,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_PARAM_NAME_REGISTRATION_MANAGER_ADDRESS,
    TASK_PARAM_DESC_REGISTRATION_MANAGER_ADDRESS,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_PARAM_NAME_AMOUNT_TO_SLASH,
    TASK_PARAM_DESC_AMOUNT_TO_SLASH,
    undefined,
    types.int
  )

module.exports = {
  deploySlasherTask,
}
