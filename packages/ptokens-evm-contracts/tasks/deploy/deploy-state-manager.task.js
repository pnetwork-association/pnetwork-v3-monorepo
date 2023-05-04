const {
  KEY_STATEMANAGER_ADDRESS,
  CONTRACT_NAME_STATEMANAGER,
  TASK_DESC_DEPLOY_STATEMANAGER,
  TASK_NAME_DEPLOY_STATEMANAGER,
  TASK_NAME_DEPLOY_CONTRACT,
} = require('../constants')
const { types } = require('hardhat/config')
const { deployPFactoryTask } = require('./deploy-pfactory.task')
const { getConfiguration } = require('./lib/configuration-manager')

const deployStateManagerTask = (_, hre) =>
  deployPFactoryTask(null, hre)
    // Leave it as a second step as the configuration may not be ready yet
    .then(_pFactory => Promise.all([_pFactory, getConfiguration()]))
    .then(([_pFactory, _config]) =>
      hre.run(TASK_NAME_DEPLOY_CONTRACT, {
        configurableName: KEY_STATEMANAGER_ADDRESS,
        contractFactoryName: CONTRACT_NAME_STATEMANAGER,
        deployArgsArray: [_pFactory.address, '120'], // to be parametrized
      })
    )

task(TASK_NAME_DEPLOY_STATEMANAGER, TASK_DESC_DEPLOY_STATEMANAGER, deployStateManagerTask)

module.exports = {
  deployStateManagerTask,
}
