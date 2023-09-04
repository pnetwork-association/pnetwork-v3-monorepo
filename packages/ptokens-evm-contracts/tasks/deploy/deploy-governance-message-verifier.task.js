task('deploy-governance-message-verifier', 'Deploy a GovernanceMessageVerifier contract')
  .addPositionalParam('governanceMessageEmitter')
  .setAction(async _args => {
    const GovernanceMessageVerifier = await ethers.getContractFactory('GovernanceMessageVerifier')
    const governanceMessageVerifier = await GovernanceMessageVerifier.deploy(
      _args.governanceMessageEmitter
    )
    console.log({
      governanceMessageVerifier: governanceMessageVerifier.address,
    })
  })
