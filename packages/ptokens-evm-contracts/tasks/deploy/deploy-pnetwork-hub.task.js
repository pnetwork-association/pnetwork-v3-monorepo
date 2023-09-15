const R = require('ramda')
const { types } = require('hardhat/config')
const { deployPFactoryTask } = require('./deploy-pfactory.task')
const { KEY_PNETWORKHUB } = require('../constants')
const { TASK_NAME_DEPLOY_CONTRACT } = require('../deploy/deploy-contract.task')

const CONTRACT_NAME_PNETWORKHUB = 'PNetworkHub'
const TASK_NAME_DEPLOY_PNETWORKHUB = 'deploy:pnetworkhub'
const TASK_DESC_DEPLOY_PNETWORKHUB =
  'Deploy a hub contract or attach to an existing one from the configuration.'
const PARAM_NAME_CHALLENGE_PERIOD = 'challengePeriod'
const PARAM_DESC_CHALLENGE_PERIOD = 'Set challenge period for pnetwork protocol state manager'

const setHubAddressInPFactory = R.curry(
  (_pFactory, _hub) =>
    console.info('Setting pNetworkHub address in pFactory...') ||
    _pFactory
      .setHub(_hub.address)
      .then(_tx => _tx.wait())
      .then(_tx => console.info(`Tx mined @ ${_tx.transactionHash}`))
      .then(_ => _hub)
)

const deployHub = R.curry(
  (taskArgs, hre, _pFactory) =>
    console.info('Deploying hub ...') ||
    hre
      .run(TASK_NAME_DEPLOY_CONTRACT, {
        configurableName: KEY_PNETWORKHUB,
        contractFactoryName: CONTRACT_NAME_PNETWORKHUB,
        deployArgsArray: [_pFactory.address, taskArgs.challengePeriod],
      })
      .then(setHubAddressInPFactory(_pFactory))
)

const deployHubTask = (taskArgs, hre) =>
  deployPFactoryTask(null, hre).then(deployHub(taskArgs, hre))

task(TASK_NAME_DEPLOY_PNETWORKHUB, TASK_DESC_DEPLOY_PNETWORKHUB)
  .addPositionalParam(
    PARAM_NAME_CHALLENGE_PERIOD,
    PARAM_DESC_CHALLENGE_PERIOD,
    undefined,
    types.string
  )
  .setAction(deployHubTask)

module.exports = {
  deployHubTask,
}
