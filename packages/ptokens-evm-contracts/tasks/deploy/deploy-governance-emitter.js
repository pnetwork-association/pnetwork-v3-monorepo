const { types } = require('hardhat/config')

task('deploy-governance-emitter', 'Deploy a GovernanceMessageEmitter contract')
  .addPositionalParam(
    'epochsManagerAddress',
    'Epochs Manager Contract Address',
    undefined,
    types.string
  )
  .addPositionalParam(
    'lendingManagerAddress',
    'Lending Manager Contract Address',
    undefined,
    types.string
  )
  .addPositionalParam(
    'registrationManagerAddress',
    'Registration Manager Contract Address',
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
    _args.epochsManagerAddress,
    _args.lendingManagerAddress,
    _args.registrationManagerAddress
  )

  console.log({
    governanceMessageEmitter: governanceMessageEmitter.address,
  })
}
