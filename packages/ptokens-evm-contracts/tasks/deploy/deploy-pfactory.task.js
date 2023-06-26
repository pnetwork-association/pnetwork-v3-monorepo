const { KEY_PFACTORY, CONTRACT_NAME_PFACTORY, TASK_NAME_DEPLOY_CONTRACT } = require('../constants')

const TASK_NAME_DEPLOY_PFACTORY = 'deploy:pfactory'
const TASK_DESC_DEPLOY_PFACTORY =
  'Deploy the pFactory contract or returns the existing address defined in the configuration.'

const deployPFactoryTask = (_, hre) =>
  console.info('Deploying pFactory ...') ||
  hre.run(TASK_NAME_DEPLOY_CONTRACT, {
    configurableName: KEY_PFACTORY,
    contractFactoryName: CONTRACT_NAME_PFACTORY,
    deployArgsArray: [],
  })

task(TASK_NAME_DEPLOY_PFACTORY, TASK_DESC_DEPLOY_PFACTORY, deployPFactoryTask)

module.exports = {
  deployPFactoryTask,
}