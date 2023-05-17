const {
  KEY_PROUTER,
  CONTRACT_NAME_PROUTER,
  TASK_DESC_DEPLOY_PROUTER,
  TASK_NAME_DEPLOY_PROUTER,
  TASK_NAME_DEPLOY_CONTRACT,
} = require('../constants')
const R = require('ramda')
const { deployPFactoryTask } = require('./deploy-pfactory.task')

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
