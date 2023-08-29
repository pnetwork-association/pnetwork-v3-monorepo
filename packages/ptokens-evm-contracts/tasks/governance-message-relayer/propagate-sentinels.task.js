task('governance-message-relayer:propagate-sentinels', 'Start the sentinel addresses propagation')
  //.addPositionalParam('registrationManager')
  //.addPositionalParam('epochsManager')
  .addPositionalParam('governanceMessagePropagator')
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
  //const RegistrationManager = await ethers.getContractFactory('RegistrationManager')
  //const EpochsManager = await ethers.getContractFactory('EpochsManager')
  const GovernanceMessagePropagator = await ethers.getContractFactory('GovernanceMessagePropagator')

  //const registrationManager = await RegistrationManager.attach(_args.registrationManager)
  //const epochsManager = await EpochsManager.attach(_args.epochsManager)
  const governanceMessagePropagator = await GovernanceMessagePropagator.attach(
    _args.governanceMessagePropagator
  )

  try {
    /*const nextEpoch = (await epochsManager.currentEpoch()) + 1
    console.log(nextEpoch)

    const events = await registrationManager.queryFilter(
      registrationManager.filters.SentinelRegistrationUpdated()
    )
    console.log(events)*/

    const sentinels = []
    // TODO get all sentinels registered in the nextEpoch

    const trasaction = await governanceMessagePropagator.propagateSentinels(sentinels)
    console.log('Sentinels addresses succesfully propagated ...', trasaction.hash)
  } catch (_err) {
    console.error(_err)
  }
}
