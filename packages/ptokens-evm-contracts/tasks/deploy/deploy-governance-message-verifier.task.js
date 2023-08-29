task('deploy-governance-message-verifier', 'Deploy a GovernanceMessageVerifier contract')
  .addPositionalParam('governanceMessagePropagator')
  .setAction(async _args => {
    const GovernanceMessageVerifier = await ethers.getContractFactory('GovernanceMessageVerifier')
    const governanceMessageVerifier = await GovernanceMessageVerifier.deploy(
      _args.governanceMessagePropagator
    )
    console.log({
      governanceMessageVerifier: governanceMessageVerifier.address,
    })
  })
