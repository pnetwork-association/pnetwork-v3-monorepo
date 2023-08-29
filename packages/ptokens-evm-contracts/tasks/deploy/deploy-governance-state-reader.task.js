task('deploy-governance-state-reader', 'Deploy a GovernanceMessagePropagator contract').setAction(
  async _args => {
    await main(_args)
      // eslint-disable-next-line no-process-exit
      .then(() => process.exit(0))
      .catch(error => {
        console.error(error)
        // eslint-disable-next-line no-process-exit
        process.exit(1)
      })
  }
)

/* eslint-disable no-console */
const main = async () => {
  const GovernanceMessagePropagator = await ethers.getContractFactory('GovernanceMessagePropagator')

  console.log('Deploying GovernanceMessagePropagator ...')
  const governanceMessagePropagator = await GovernanceMessagePropagator.deploy()

  console.log({
    governanceMessagePropagator: governanceMessagePropagator.address,
  })
}
