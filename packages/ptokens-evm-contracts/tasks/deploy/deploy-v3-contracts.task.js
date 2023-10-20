const deployPToken = async (
  _underlyingAssetName,
  _underlyingAssetSymbol,
  _underlyingAssetDecimals,
  _underlyingAssetTokenAddress,
  _underlyingAssetNetworkId,
  { pFactory }
) => {
  const PToken = await ethers.getContractFactory('PToken')
  const transaction = await pFactory.deploy(
    _underlyingAssetName,
    _underlyingAssetSymbol,
    _underlyingAssetDecimals,
    _underlyingAssetTokenAddress,
    _underlyingAssetNetworkId
  )
  const receipt = await transaction.wait()
  const event = receipt.events.find(({ event }) => event === 'PTokenDeployed')
  const { pTokenAddress } = event.args
  return await PToken.attach(pTokenAddress)
}

task('pnetwork-deploy-v3-contracts', 'Deploy v3 contracts providing an underlying asset')
  .addPositionalParam('underlyingAssetName')
  .addPositionalParam('underlyingAssetSymbol')
  .addPositionalParam('underlyingAssetDecimals')
  .addPositionalParam('underlyingAssetAddress')
  .addPositionalParam('underlyingAssetNetworkId')
  .addPositionalParam('baseChallengePeriodDuration')
  .addPositionalParam('feesManager')
  .addPositionalParam('telepathyRouter')
  .addPositionalParam('governanceMessageVerifier')
  .addPositionalParam('slasher')
  .addPositionalParam('lockedAmountChallengePeriod')
  .addPositionalParam('kChallengePeriod')
  .addPositionalParam('maxOperationsInQueue')
  .addPositionalParam('interimChainNetworkId')
  .addPositionalParam('lockedAmountOpenChallenge')
  .addPositionalParam('maxChallengeDuration')
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
  const PFactory = await ethers.getContractFactory('PFactory')
  const EpochsManager = await ethers.getContractFactory('EpochsManager')

  console.log('Deploying EpochsManager ...')
  const epochsManager = await EpochsManager.deploy()

  console.log('Deploying PFactory ...')
  const pFactory = await PFactory.deploy()

  console.log('Deploying PNetworkHub ...')
  const hub = await PNetworkHub.deploy(
    pFactory.address,
    _args.baseChallengePeriodDuration,
    epochsManager.address,
    _args.feesManager_,
    _args.telepathyRouter,
    _args.governanceMessageVerifier,
    _args.slasher,
    _args.lockedAmountChallengePeriod,
    _args.kChallengePeriod,
    _args.maxOperationsInQueue,
    _args.interimChainNetworkId,
    _args.lockedAmountOpenChallenge,
    _args.maxChallengeDuration
  )

  console.log('Setting hub ...')
  await pFactory.setHub(hub.address)

  console.log('Renouncing ownership ...')
  await pFactory.renounceOwnership()

  console.log('Deploying pToken ...')
  const pToken = await deployPToken(
    _args.underlyingAssetName,
    _args.underlyingAssetSymbol,
    _args.underlyingAssetDecimals,
    _args.underlyingAssetAddress,
    _args.underlyingAssetNetworkId,
    {
      pFactory,
    }
  )

  console.log(
    JSON.stringify({
      pFactory: pFactory.address,
      hub: hub.address,
      pToken: pToken.address,
      epochsManager: epochsManager.address,
      initArgs: {
        ..._args,
      },
    })
  )
}

/* eslint-enable no-console */
