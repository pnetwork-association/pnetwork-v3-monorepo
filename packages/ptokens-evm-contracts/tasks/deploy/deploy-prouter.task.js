const R = require('ramda')
const { KEY_PROUTER } = require('../constants')
const { deployPFactoryTask } = require('./deploy-pfactory.task')
const { TASK_NAME_DEPLOY_CONTRACT } = require('../deploy/deploy-contract.task')

const CONTRACT_NAME_PROUTER = 'PRouter'
const TASK_NAME_DEPLOY_PROUTER = 'deploy:prouter'
const TASK_DESC_DEPLOY_PROUTER =
  'Deploy the pRouter contract or retrieve an existing one from the configuration.'

const setRouterAddressInPFactory = R.curry(
  (_pFactory, _pRouter) =>
    console.info('Setting pRouter address in pFactory...') ||
    _pFactory
      .setRouter(_pRouter.address)
      .then(_tx => _tx.wait())
      .then(_tx => console.info(`Tx mined @ ${_tx.transactionHash}`))
      .then(_ => _pRouter)
)

const deployPRouter = R.curry(
  (hre, _pFactory) =>
    console.info('Deploying pRouter ...') ||
    hre
      .run(TASK_NAME_DEPLOY_CONTRACT, {
        configurableName: KEY_PROUTER,
        contractFactoryName: CONTRACT_NAME_PROUTER,
        deployArgsArray: [_pFactory.address],
      })
      .then(setRouterAddressInPFactory(_pFactory))
)

const deployPRouterTask = (_, hre) => deployPFactoryTask(null, hre).then(deployPRouter(hre))

task(TASK_NAME_DEPLOY_PROUTER, TASK_DESC_DEPLOY_PROUTER, deployPRouterTask)

module.exports = {
  deployPRouterTask,
}
