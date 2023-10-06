const TASK_CONSTANTS = require('../constants')
const { TASK_NAME_DEPLOY_CONTRACT } = require('../deploy/deploy-contract.task')
const TASK_NAME_DEPLOY_PFACTORY = 'deploy:pfactory'
const TASK_DESC_DEPLOY_PFACTORY =
  'Deploy the pFactory contract or returns the existing address defined in the configuration.'

const deployPFactoryTask = (_, hre) =>
  console.info('Deploying pFactory ...') ||
  hre.ethers.getSigner().then(_signer =>
    hre.run(TASK_NAME_DEPLOY_CONTRACT, {
      configurableName: TASK_CONSTANTS.KEY_PFACTORY,
      contractFactoryName: TASK_CONSTANTS.CONTRACT_NAME_PFACTORY,
      deployArgsArray: [_signer.address],
    })
  )

task(TASK_NAME_DEPLOY_PFACTORY, TASK_DESC_DEPLOY_PFACTORY, deployPFactoryTask)

module.exports = {
  deployPFactoryTask,
}
