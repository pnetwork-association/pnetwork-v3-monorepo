const { types } = require('hardhat/config')

const TASK_CONSTANTS = require('../constants')

task('deploy-governance-emitter', 'Deploy a GovernanceMessageEmitter contract')
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
  .setAction(async _args => {
    await main(_args)
      // eslint-disable-next-line no-process-exit
      .then(() => process.exit(0))
      .catch(error => {
        console.error(error)
        // eslint-disable-next-line no-process-exit
        process.exit(1)
      })
  })

/* eslint-disable no-console */
const main = async _args => {
  const GovernanceMessageEmitter = await ethers.getContractFactory('GovernanceMessageEmitter')

  console.log('Deploying GovernanceMessageEmitter ...')
  const governanceMessageEmitter = await GovernanceMessageEmitter.deploy(
    _args[TASK_CONSTANTS.PARAM_NAME_EPOCHS_MANAGER],
    _args[TASK_CONSTANTS.PARAM_NAME_LENDING_MANAGER],
    _args[TASK_CONSTANTS.PARAM_NAME_REGISTRATION_MANAGER_ADDRESS]
  )

  console.log({
    [TASK_CONSTANTS.PARAM_NAME_GOVERNANCE_MESSAGE_EMITTER]: governanceMessageEmitter.address,
  })
}
