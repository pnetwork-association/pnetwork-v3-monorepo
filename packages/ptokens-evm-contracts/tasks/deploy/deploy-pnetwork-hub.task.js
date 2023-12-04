const R = require('ramda')
const { types } = require('hardhat/config')
const { deployPFactoryTask } = require('./deploy-pfactory.task')
const TASK_CONSTANTS = require('../constants')
const { TASK_NAME_DEPLOY_CONTRACT } = require('../deploy/deploy-contract.task')

const TASK_NAME_DEPLOY_PNETWORKHUB = 'deploy:pnetworkhub'
const TASK_DESC_DEPLOY_PNETWORKHUB =
  'Deploy a hub contract or attach to an existing one from the configuration.'

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
        configurableName: TASK_CONSTANTS.KEY_PNETWORKHUB,
        contractFactoryName: TASK_CONSTANTS.CONTRACT_NAME_PNETWORKHUB,
        deployArgsArray: [
          _pFactory.address,
          taskArgs[TASK_CONSTANTS.PARAM_NAME_BASE_CHALLENGE_PERIOD],
          taskArgs[TASK_CONSTANTS.PARAM_NAME_EPOCHS_MANAGER],
          taskArgs[TASK_CONSTANTS.PARAM_NAME_FEES_MANAGER],
          taskArgs[TASK_CONSTANTS.PARAM_NAME_TELEPATHY_ROUTER],
          taskArgs[TASK_CONSTANTS.PARAM_NAME_GOVERNANCE_MESSAGE_VERIFIER],
          taskArgs[TASK_CONSTANTS.PARAM_NAME_SLASHER],
          taskArgs[TASK_CONSTANTS.PARAM_NAME_DANDELION_VOTING_ADDRESS],
          taskArgs[TASK_CONSTANTS.PARAM_NAME_LOCKED_AMOUNT_CHALLENGE_PERIOD],
          taskArgs[TASK_CONSTANTS.PARAM_NAME_K_CHALLENGE_PERIOD],
          taskArgs[TASK_CONSTANTS.PARAM_NAME_MAX_OPERATIONS_IN_QUEUE],
          taskArgs[TASK_CONSTANTS.PARAM_NAME_INTERIM_CHAIN_NETWORK_ID],
          taskArgs[TASK_CONSTANTS.PARAM_NAME_LOCKED_AMOUNT_OPEN_CHALLENGE],
          taskArgs[TASK_CONSTANTS.PARAM_NAME_MAX_CHALLENGE_DURATIONO],
          taskArgs[TASK_CONSTANTS.PARAM_NAME_EXPECTED_SOURCE_CHAIN_ID],
        ],
      })
      .then(setHubAddressInPFactory(_pFactory))
)

const deployHubTask = (taskArgs, hre) =>
  deployPFactoryTask(null, hre).then(deployHub(taskArgs, hre))

task(TASK_NAME_DEPLOY_PNETWORKHUB, TASK_DESC_DEPLOY_PNETWORKHUB)
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_BASE_CHALLENGE_PERIOD,
    TASK_CONSTANTS.PARAM_DESC_BASE_CHALLENGE_PERIOD,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_EPOCHS_MANAGER,
    TASK_CONSTANTS.PARAM_DESC_EPOCHS_MANAGER,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_FEES_MANAGER,
    TASK_CONSTANTS.PARAM_DESC_FEES_MANAGER,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_TELEPATHY_ROUTER,
    TASK_CONSTANTS.PARAM_DESC_TELEPATHY_ROUTER,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_GOVERNANCE_MESSAGE_VERIFIER,
    TASK_CONSTANTS.PARAM_DESC_GOVERNANCE_MESSAGE_VERIFIER,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_SLASHER,
    TASK_CONSTANTS.PARAM_DESC_SLASHER,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_DANDELION_VOTING_ADDRESS,
    TASK_CONSTANTS.PARAM_DESC_DANDELION_VOTING_ADDRESS,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_LOCKED_AMOUNT_CHALLENGE_PERIOD,
    TASK_CONSTANTS.PARAM_DESC_LOCKED_AMOUNT_CHALLENGE_PERIOD,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_K_CHALLENGE_PERIOD,
    TASK_CONSTANTS.PARAM_DESC_K_CHALLENGE_PERIOD,
    undefined,
    types.int
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_MAX_OPERATIONS_IN_QUEUE,
    TASK_CONSTANTS.PARAM_DESC_MAX_OPERATIONS_IN_QUEUE,
    undefined,
    types.int
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_INTERIM_CHAIN_NETWORK_ID,
    TASK_CONSTANTS.PARAM_DESC_INTERIM_CHAIN_NETWORK_ID,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_LOCKED_AMOUNT_OPEN_CHALLENGE,
    TASK_CONSTANTS.PARAM_DESC_LOCKED_AMOUNT_OPEN_CHALLENGE,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_MAX_CHALLENGE_DURATIONO,
    TASK_CONSTANTS.PARAM_DESC_MAX_CHALLENGE_DURATION,
    undefined,
    types.int
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_EXPECTED_SOURCE_CHAIN_ID,
    TASK_CONSTANTS.PARAM_DESC_EXPECTED_SOURCE_CHAIN_ID,
    undefined,
    types.int
  )
  .setAction(deployHubTask)

module.exports = {
  deployHubTask,
}
