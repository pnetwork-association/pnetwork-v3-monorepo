const { types } = require('hardhat/config')

const TASK_CONSTANTS = require('../constants')

task('deploy-governance-message-verifier', 'Deploy a GovernanceMessageVerifier contract')
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_GOVERNANCE_MESSAGE_EMITTER,
    TASK_CONSTANTS.PARAM_DESC_GOVERNANCE_MESSAGE_EMITTER,
    undefined,
    types.string
  )
  .setAction(async _args => {
    const GovernanceMessageVerifier = await ethers.getContractFactory('GovernanceMessageVerifier')
    const governanceMessageVerifier = await GovernanceMessageVerifier.deploy(
      _args[TASK_CONSTANTS.PARAM_NAME_GOVERNANCE_MESSAGE_EMITTER]
    )
    console.log({
      [TASK_CONSTANTS.PARAM_NAME_GOVERNANCE_MESSAGE_VERIFIER]: governanceMessageVerifier.address,
    })
  })
