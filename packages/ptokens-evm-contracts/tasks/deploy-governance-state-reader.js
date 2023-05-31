task('deploy-governance-state-reader', 'Deploy a GovernanceStateReader contract').setAction(
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
  const GovernanceStateReader = await ethers.getContractFactory('GovernanceStateReader')

  console.log('Deploying GovernanceStateReader ...')
  const governanceStateReader = await GovernanceStateReader.deploy()

  console.log({
    governanceStateReader: governanceStateReader.address,
  })
}
