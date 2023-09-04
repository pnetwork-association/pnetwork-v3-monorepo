task('deploy-governance-state-reader', 'Deploy a GovernanceMessageEmitter contract').setAction(
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
  const GovernanceMessageEmitter = await ethers.getContractFactory('GovernanceMessageEmitter')

  console.log('Deploying GovernanceMessageEmitter ...')
  const governanceMessageEmitter = await GovernanceMessageEmitter.deploy()

  console.log({
    governanceMessageEmitter: governanceMessageEmitter.address,
  })
}
