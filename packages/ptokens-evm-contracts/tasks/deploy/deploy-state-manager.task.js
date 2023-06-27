const R = require('ramda')
const { types } = require('hardhat/config')
const { deployPFactoryTask } = require('./deploy-pfactory.task')
const { KEY_STATEMANAGER } = require('../constants')
const { TASK_NAME_DEPLOY_CONTRACT } = require('../deploy/deploy-contract.task')

const CONTRACT_NAME_STATEMANAGER = 'StateManager'
const TASK_NAME_DEPLOY_STATEMANAGER = 'deploy:statemanager'
const TASK_DESC_DEPLOY_STATEMANAGER =
  'Deploy a stateManager contract or attach to an existing one from the configuration.'
const PARAM_NAME_CHALLENGE_PERIOD = 'challengePeriod'
const PARAM_DESC_CHALLENGE_PERIOD = 'Set challenge period for pnetwork protocol state manager'

const setStateManagerAddressInPFactory = R.curry(
  (_pFactory, _pStateManager) =>
    console.info('Setting pStateManager address in pFactory...') ||
    _pFactory
      .setStateManager(_pStateManager.address)
      .then(_tx => _tx.wait())
      .then(_tx => console.info(`Tx mined @ ${_tx.transactionHash}`))
      .then(_ => _pStateManager)
)

const deployStateManager = R.curry(
  (taskArgs, hre, _pFactory) =>
    console.info('Deploying stateManager ...') ||
    hre
      .run(TASK_NAME_DEPLOY_CONTRACT, {
        configurableName: KEY_STATEMANAGER,
        contractFactoryName: CONTRACT_NAME_STATEMANAGER,
        deployArgsArray: [_pFactory.address, taskArgs.challengePeriod],
      })
      .then(setStateManagerAddressInPFactory(_pFactory))
)

const deployStateManagerTask = (taskArgs, hre) =>
  deployPFactoryTask(null, hre).then(deployStateManager(taskArgs, hre))

task(TASK_NAME_DEPLOY_STATEMANAGER, TASK_DESC_DEPLOY_STATEMANAGER)
  .addPositionalParam(
    PARAM_NAME_CHALLENGE_PERIOD,
    PARAM_DESC_CHALLENGE_PERIOD,
    undefined,
    types.string
  )
  .setAction(deployStateManagerTask)

module.exports = {
  deployStateManagerTask,
}
