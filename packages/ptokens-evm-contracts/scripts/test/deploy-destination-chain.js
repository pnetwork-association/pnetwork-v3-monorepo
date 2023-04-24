const { ethers } = require('hardhat')
const { QUEUE_TIME, PNETWORK_NETWORK_IDS, CHALLENGE_TIME} = require('../config')
const { deployPToken } = require('../../test/utils')

// Deploy on a destination chain: underlying asset should not be in this chain.
/* eslint-disable no-console */
const main = async () => {
  const StateManager = await ethers.getContractFactory('StateManager')
  const PRouter = await ethers.getContractFactory('PRouter')
  const PFactory = await ethers.getContractFactory('PFactory')
  const EpochsManager = await ethers.getContractFactory('EpochsManager')

  console.log('Deploying dummy EpochsManager ...')
  const pEpochsManager = await EpochsManager.deploy(CHALLENGE_TIME)
  console.log('Deploying PFactory ...')
  const pFactory = await PFactory.deploy()
  console.log('Deploying PRouter ...')
  const pRouter = await PRouter.deploy(pFactory.address)
  console.log('Deploying StateManager ...')
  const stateManager = await StateManager.deploy(pFactory.address, pEpochsManager.address, QUEUE_TIME)
  console.log('Deploying Token ...')
  

  console.log('Setting pRouter ...')
  await pFactory.setRouter(pRouter.address)
  console.log('Setting stateManager ...')
  await pFactory.setStateManager(stateManager.address)
  console.log('Renouncing ownership ...')
  await pFactory.renounceOwnership()

  // Deploy pToken using data from the underlying asset on the original chain
  console.log('Deploying pToken ...')
  const pToken = await deployPToken(
    'Token',
    'TKN',
    18,
    '0xA2a4F06361C5913F1f2deb7E265EE21a09B8474e',
    PNETWORK_NETWORK_IDS.sepolia,
    {
      pFactory,
    }
  )

  console.log({
    pFactory: pFactory.address,
    pRouter: pRouter.address,
    stateManager: stateManager.address,
    pToken: pToken.address,
    dummyEpochsManager: pEpochsManager.address
  })
}

main()
  // eslint-disable-next-line no-process-exit
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  })

/* eslint-enable no-console */
