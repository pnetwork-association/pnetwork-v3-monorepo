task('governance-message-relayer:read-sentinels-root', 'Read the sentinels root values')
  .addPositionalParam('hub')
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
  const PNetworkHub = await ethers.getContractFactory('PNetworkHub')
  const hub = await PNetworkHub.attach(_args.hub)
  console.log(await hub.getSentinelsMerkleRootForEpoch(_args.hub))
}
