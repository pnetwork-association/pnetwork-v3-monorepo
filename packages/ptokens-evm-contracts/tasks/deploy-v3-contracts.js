const { deployPToken } = require('../test/utils')

task('pnetwork-deploy-v3-contracts', 'Deploy v3 contracts providing an underlying asset')
  .addPositionalParam('underlyingAssetName')
  .addPositionalParam('underlyingAssetSymbol')
  .addPositionalParam('underlyingAssetDecimals')
  .addPositionalParam('underlyingAssetAddress')
  .addPositionalParam('underlyingAssetNetworkId')
  .addPositionalParam('baseChallengePeriodDuration')
  .addPositionalParam('telepathyRouter')
  .addPositionalParam('governanceMessageVerifier')
  .addPositionalParam('allowedSourceChainId')
  .addPositionalParam('lockedAmountChallengePeriod')
  .addPositionalParam('kChallengePeriod')
  .addPositionalParam('maxOperationsInQueue')
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
  const StateManager = await ethers.getContractFactory('StateManager')
  const PRouter = await ethers.getContractFactory('PRouter')
  const PFactory = await ethers.getContractFactory('PFactory')
  const EpochsManager = await ethers.getContractFactory('EpochsManager')

  console.log('Deploying EpochsManager ...')
  const pEpochsManager = await EpochsManager.deploy()
  console.log('Deploying PFactory ...')
  const pFactory = await PFactory.deploy()
  console.log('Deploying PRouter ...')
  const pRouter = await PRouter.deploy(pFactory.address)
  console.log('Deploying StateManager ...')

  const stateManager = await StateManager.deploy(
    pFactory.address,
    _args.baseChallengePeriodDuration,
    pEpochsManager.address,
    _args.telepathyRouter,
    _args.governanceMessageVerifier,
    _args.allowedSourceChainId,
    _args.lockedAmountChallengePeriod,
    _args.kChallengePeriod,
    _args.maxOperationsInQueue
  )

  console.log('Setting pRouter ...')
  await pFactory.setRouter(pRouter.address)
  console.log('Setting stateManager ...')
  await pFactory.setStateManager(stateManager.address)
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

  console.log({
    pFactory: pFactory.address,
    pRouter: pRouter.address,
    stateManager: stateManager.address,
    pToken: pToken.address,
    dummyEpochsManager: pEpochsManager.address,
  })
}

/* eslint-enable no-console */
