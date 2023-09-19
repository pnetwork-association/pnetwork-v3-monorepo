const { types } = require('hardhat/config')

const TASK_CONSTANTS = require('../constants')
const { TASK_NAME_DEPLOY_CONTRACT } = require('../deploy/deploy-contract.task')

const deployGovernanceMessageVerifier = (_args, hre) =>
  console.info('Deploying Governance Message Verifier ...') ||
  hre.run(TASK_NAME_DEPLOY_CONTRACT, {
    configurableName: TASK_CONSTANTS.KEY_GOVERNANCE_MESSAGE_VERIFIER,
    contractFactoryName: TASK_CONSTANTS.CONTRACT_NAME_GOVERNANCE_MESSAGE_VERIFIER,
    deployArgsArray: [_args[TASK_CONSTANTS.PARAM_NAME_GOVERNANCE_MESSAGE_EMITTER]],
  })

task(
  'deploy:governance-message-verifier',
  'Deploy a GovernanceMessageVerifier contract',
  deployGovernanceMessageVerifier
).addPositionalParam(
  TASK_CONSTANTS.PARAM_NAME_GOVERNANCE_MESSAGE_EMITTER,
  TASK_CONSTANTS.PARAM_DESC_GOVERNANCE_MESSAGE_EMITTER,
  undefined,
  types.string
)
