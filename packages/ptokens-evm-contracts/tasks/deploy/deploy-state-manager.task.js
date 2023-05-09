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

const deployStateManagerTask = ({ challengePeriod }, hre) =>
  deployPFactoryTask(null, hre)
    // Leave it as a second step as the configuration may not be ready yet
    .then(_pFactory => Promise.all([_pFactory, getConfiguration()]))
    .then(([_pFactory, _config]) =>
      hre.run(TASK_NAME_DEPLOY_CONTRACT, {
        configurableName: KEY_STATEMANAGER_ADDRESS,
        contractFactoryName: CONTRACT_NAME_STATEMANAGER,
        deployArgsArray: [_pFactory.address, challengePeriod],
      })
    )

task(TASK_NAME_DEPLOY_STATEMANAGER, TASK_DESC_DEPLOY_STATEMANAGER)
  .addPositionalParam(
    'challengePeriod',
    'Set challenge period for pnetwork protocol state manager',
    undefined,
    types.string
  )
  .setAction(deployStateManagerTask)

module.exports = {
  deployStateManagerTask,
}
