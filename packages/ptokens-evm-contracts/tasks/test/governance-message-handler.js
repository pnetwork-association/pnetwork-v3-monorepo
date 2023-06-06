const { QUEUE_TIME, ZERO_ADDRESS } = require('../config')

task('deploy-test-governance-message-handler', 'Test the governance messages on the StateManager')
  .addPositionalParam('epochsManager')
  .addPositionalParam('telepathyRouter')
  .addPositionalParam('governanceMessageVerifier')
  .addPositionalParam('allowedSourceChainId')
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
  const StateManager = await ethers.getContractFactory('StateManager')
  const stateManager = await StateManager.deploy(
    ZERO_ADDRESS,
    QUEUE_TIME,
    _args.epochsManager,
    _args.telepathyRouter,
    _args.governanceMessageVerifier,
    _args.allowedSourceChainId
  )
  console.log({
    stateManager: stateManager.address,
  })
}

/* eslint-enable no-console */
