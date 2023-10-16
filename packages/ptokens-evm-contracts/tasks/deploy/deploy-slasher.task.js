const { types } = require('hardhat/config')

const TASK_CONSTANTS = require('../constants')
const { TASK_NAME_DEPLOY_CONTRACT } = require('../deploy/deploy-contract.task')

const TASK_NAME_DEPLOY_SLASHER = 'deploy:slasher'
const TASK_DESC_DEPLOY_SLASHER =
  'Deploy the slasher contract or returns the existing address defined in the configuration.'

const deploySlasherTask = (_args, hre) =>
  console.info('Deploying slasher ...') ||
  hre.run(TASK_NAME_DEPLOY_CONTRACT, {
    configurableName: TASK_CONSTANTS.KEY_SLASHER,
    contractFactoryName: TASK_CONSTANTS.CONTRACT_NAME_SLASHER,
    deployArgsArray: [
      _args[TASK_CONSTANTS.PARAM_NAME_EPOCHS_MANAGER],
      _args[TASK_CONSTANTS.PARAM_NAME_PREGISTRY],
      _args[TASK_CONSTANTS.PARAM_NAME_REGISTRATION_MANAGER_ADDRESS],
      _args[TASK_CONSTANTS.PARAM_NAME_AMOUNT_TO_SLASH],
    ],
  })

task(TASK_NAME_DEPLOY_SLASHER, TASK_DESC_DEPLOY_SLASHER, deploySlasherTask)
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_EPOCHS_MANAGER,
    TASK_CONSTANTS.PARAM_DESC_EPOCHS_MANAGER,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_PREGISTRY,
    TASK_CONSTANTS.PARAM_DESC_PREGISTRY,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_REGISTRATION_MANAGER_ADDRESS,
    TASK_CONSTANTS.PARAM_DESC_REGISTRATION_MANAGER_ADDRESS,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_AMOUNT_TO_SLASH,
    TASK_CONSTANTS.PARAM_DESC_AMOUNT_TO_SLASH,
    undefined,
    types.string
  )

module.exports = {
  deploySlasherTask,
}
