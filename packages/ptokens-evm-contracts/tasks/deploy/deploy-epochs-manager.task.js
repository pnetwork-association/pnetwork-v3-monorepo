const TASK_CONSTANTS = require('../constants')
const { TASK_NAME_DEPLOY_CONTRACT } = require('../deploy/deploy-contract.task')
const TASK_NAME_DEPLOY_EPOCHS_MANAGER = 'deploy:epochsManager'
const TASK_DESC_DEPLOY_EPOCHS_MANAGER =
  'Deploy the Epochs Manager contract or returns the existing address defined in the configuration.'

const deploEpochsManagerTask = (_, hre) =>
  console.info('Deploying Epochs Manager ...') ||
  hre.run(TASK_NAME_DEPLOY_CONTRACT, {
    configurableName: TASK_CONSTANTS.KEY_EPOCHS_MANAGER,
    contractFactoryName: TASK_CONSTANTS.CONTRACT_NAME_EPOCHS_MANAGER,
    deployArgsArray: [],
  })

task(TASK_NAME_DEPLOY_EPOCHS_MANAGER, TASK_DESC_DEPLOY_EPOCHS_MANAGER, deploEpochsManagerTask)

module.exports = {
  deploEpochsManagerTask,
}
