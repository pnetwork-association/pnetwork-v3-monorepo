task('deploy-test-governance-message-handler', 'Test the governance messages on the StateManager')
  .addPositionalParam('baseChallengePeriodDuration')
  .addPositionalParam('epochsManager')
  .addPositionalParam('telepathyRouter')
  .addPositionalParam('governanceMessageVerifier')
  .addPositionalParam('allowedSourceChainId')
  .addPositionalParam('lockedAmountChallengePeriod')
  .addPositionalParam('kChallengePeriod')
  .addPositionalParam('maxOperationsInQueue')
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
    '0x0000000000000000000000000000000000000000',
    _args.baseChallengePeriodDuration,
    _args.epochsManager,
    _args.telepathyRouter,
    _args.governanceMessageVerifier,
    _args.allowedSourceChainId,
    _args.lockedAmountChallengePeriod,
    _args.kChallengePeriod,
    _args.maxOperationsInQueue
  )
  console.log({
    stateManager: stateManager.address,
  })
}

/* eslint-enable no-console */
