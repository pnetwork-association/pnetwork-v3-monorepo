task('governance-message-relayer:read-sentinels-root', 'Read the sentinels root values')
  .addPositionalParam('stateManager')
  .addPositionalParam('epoch')
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
  const stateManager = await StateManager.attach(_args.stateManager)
  console.log(await stateManager.getSentinelsRootForEpoch(_args.stateManager))
}
