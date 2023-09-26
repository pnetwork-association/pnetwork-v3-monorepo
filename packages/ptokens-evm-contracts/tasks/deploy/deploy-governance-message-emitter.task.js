const { types } = require('hardhat/config')

const TASK_CONSTANTS = require('../constants')
const { TASK_NAME_DEPLOY_CONTRACT } = require('../deploy/deploy-contract.task')

const deployGovernanceMessageEmitter = (_args, hre) =>
  console.info('Deploying Governance Message Emitter ...') ||
  hre.run(TASK_NAME_DEPLOY_CONTRACT, {
    configurableName: TASK_CONSTANTS.KEY_GOVERNANCE_MESSAGE_EMITTER,
    contractFactoryName: TASK_CONSTANTS.CONTRACT_NAME_GOVERNANCE_MESSAGE_EMITTER,
    deployArgsArray: [
      _args[TASK_CONSTANTS.PARAM_NAME_EPOCHS_MANAGER],
      _args[TASK_CONSTANTS.PARAM_NAME_LENDING_MANAGER],
      _args[TASK_CONSTANTS.PARAM_NAME_REGISTRATION_MANAGER_ADDRESS],
      _args[TASK_CONSTANTS.PARAM_NAME_PREGISTRY],
    ],
  })

task(
  'deploy:governance-message-emitter',
  'Deploy a GovernanceMessageEmitter contract',
  deployGovernanceMessageEmitter
)
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_EPOCHS_MANAGER,
    TASK_CONSTANTS.PARAM_DESC_EPOCHS_MANAGER,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_LENDING_MANAGER,
    TASK_CONSTANTS.PARAM_DESC_LENDING_MANAGER,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_REGISTRATION_MANAGER_ADDRESS,
    TASK_CONSTANTS.PARAM_DESC_REGISTRATION_MANAGER_ADDRESS,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_PREGISTRY,
    TASK_CONSTANTS.PARAM_DESC_PREGISTRY,
    undefined,
    types.string
  )
