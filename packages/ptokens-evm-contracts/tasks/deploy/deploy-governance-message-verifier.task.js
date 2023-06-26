task('deploy-governance-message-verifier', 'Deploy a GovernanceMessageVerifier contract')
  .addPositionalParam('governanceStateReader')
  .setAction(async _args => {
    const GovernanceMessageVerifier = await ethers.getContractFactory('GovernanceMessageVerifier')
    const governanceMessageVerifier = await GovernanceMessageVerifier.deploy(
      _args.governanceStateReader
    )
    console.log({
      governanceMessageVerifier: governanceMessageVerifier.address,
    })
  })