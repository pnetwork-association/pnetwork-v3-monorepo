const {
  KEY_PFACTORY_ADDRESS,
  CONTRACT_NAME_PFACTORY,
  TASK_DESC_DEPLOY_PFACTORY,
  TASK_NAME_DEPLOY_PFACTORY,
  TASK_NAME_DEPLOY_CONTRACT,
} = require('../constants')

const deployPFactoryTask = (_, hre) =>
  hre.run(TASK_NAME_DEPLOY_CONTRACT, {
    configurableName: KEY_PFACTORY_ADDRESS,
    contractFactoryName: CONTRACT_NAME_PFACTORY,
    deployArgsArray: [],
  })

task(TASK_NAME_DEPLOY_PFACTORY, TASK_DESC_DEPLOY_PFACTORY, deployPFactoryTask)

module.exports = {
  deployPFactoryTask,
}
