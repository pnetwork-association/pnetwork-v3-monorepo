const { ethers } = require('hardhat')
const { QUEUE_TIME, PNETWORK_NETWORK_IDS } = require('../config')
const { deployPToken } = require('../../test/utils')

/* eslint-disable no-console */
const main = async () => {
  const StateManager = await ethers.getContractFactory('StateManager')
  const PRouter = await ethers.getContractFactory('PRouter')
  const PFactory = await ethers.getContractFactory('PFactory')
  const StandardToken = await ethers.getContractFactory('StandardToken')

  console.log('Deploying PFactory ...')
  const pFactory = await PFactory.deploy()
  console.log('Deploying PRouter ...')
  const pRouter = await PRouter.deploy(pFactory.address)
  console.log('Deploying StateManager ...')
  const stateManager = await StateManager.deploy(pFactory.address, QUEUE_TIME)
  console.log('Deploying Token ...')
  const token = await StandardToken.deploy(
    'Token',
    'TKN',
    ethers.utils.parseEther('100000000')
  )

  console.log('Setting pRouter ...')
  await pFactory.setRouter(pRouter.address)
  console.log('Setting stateManager ...')
  await pFactory.setStateManager(stateManager.address)
  console.log('Renouncing ownership ...')
  await pFactory.renounceOwnership()

  console.log('Deploying pToken ...')
  const pToken = await deployPToken(
    await token.name(),
    await token.symbol(),
    await token.decimals(),
    token.address,
    PNETWORK_NETWORK_IDS.sepolia,
    {
      pFactory,
    }
  )

  console.log({
    pFactory: pFactory.address,
    pRouter: pRouter.address,
    stateManager: stateManager.address,
    token: token.address,
    pToken: pToken.address,
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
