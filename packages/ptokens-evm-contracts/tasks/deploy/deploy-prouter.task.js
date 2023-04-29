const {
  KEY_PROUTER_ADDRESS,
  CONTRACT_NAME_PROUTER,
  TASK_DESC_DEPLOY_PROUTER,
  TASK_NAME_DEPLOY_PROUTER,
  TASK_NAME_DEPLOY_CONTRACT,
} = require('../constants')
const { deployPFactoryTask } = require('./deploy-pfactory.task')

const deployPRouterTask = (_, hre) =>
  deployPFactoryTask(null, hre)
  .then(_pFactory =>
    hre.run(TASK_NAME_DEPLOY_CONTRACT, {
      configurableName: KEY_PROUTER_ADDRESS,
      contractFactoryName: CONTRACT_NAME_PROUTER,
      deployArgsArray: [_pFactory.address],
    })
  )

task(TASK_NAME_DEPLOY_PROUTER, TASK_DESC_DEPLOY_PROUTER, deployPRouterTask)

module.exports = {
  deployPRouterTask,
}
