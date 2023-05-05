const { deployPToken } = require('../test/utils')
const { QUEUE_TIME, CHALLENGE_TIME } = require('./config')

task('pnetwork-deploy-v3-contracts', 'Deploy v3 contracts providing an underlying asset')
  .addPositionalParam('underlyingAssetName')
  .addPositionalParam('underlyingAssetSymbol')
  .addPositionalParam('underlyingAssetDecimals')
  .addPositionalParam('underlyingAssetAddress')
  .addPositionalParam('underlyingAssetNetworkId')
  .setAction(async taskArgs => {
    console.log(taskArgs)
    console.log(`queueTime: ${QUEUE_TIME} \nchallengeTime: ${CHALLENGE_TIME} \n`)
    await main(taskArgs)
      // eslint-disable-next-line no-process-exit
      .then(() => process.exit(0))
      .catch(error => {
        console.error(error)
        // eslint-disable-next-line no-process-exit
        process.exit(1)
      })
  })

/* eslint-disable no-console */
const main = async config => {
  const StateManager = await ethers.getContractFactory('StateManager')
  const PRouter = await ethers.getContractFactory('PRouter')
  const PFactory = await ethers.getContractFactory('PFactory')
  const EpochsManager = await ethers.getContractFactory('EpochsManager')

  console.log('Deploying EpochsManager ...')
  const pEpochsManager = await EpochsManager.deploy(CHALLENGE_TIME)
  console.log('Deploying PFactory ...')
  const pFactory = await PFactory.deploy()
  console.log('Deploying PRouter ...')
  const pRouter = await PRouter.deploy(pFactory.address)
  console.log('Deploying StateManager ...')
  const stateManager = await StateManager.deploy(
    pFactory.address,
    pEpochsManager.address,
    QUEUE_TIME
  )
  console.log('Deploying Token ...')

  console.log('Setting pRouter ...')
  await pFactory.setRouter(pRouter.address)
  console.log('Setting stateManager ...')
  await pFactory.setStateManager(stateManager.address)
  console.log('Renouncing ownership ...')
  await pFactory.renounceOwnership()

  console.log('Deploying pToken ...')
  const pToken = await deployPToken(
    config.underlyingAssetName,
    config.underlyingAssetSymbol,
    config.underlyingAssetDecimals,
    config.underlyingAssetAddress,
    config.underlyingAssetNetworkId,
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
