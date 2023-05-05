const { expect } = require('chai')
const { ethers } = require('hardhat')
const { time } = require('@nomicfoundation/hardhat-network-helpers')

const { QUEUE_TIME, PNETWORK_NETWORK_IDS, ZERO_ADDRESS } = require('./constants')
const { deployPToken } = require('./utils')

let token,
  owner,
  pToken,
  pRouter,
  pFactory,
  stateManager,
  relayer,
  testReceiver,
  testNotReceiver,
  user1

describe('StateManager', () => {
  beforeEach(async () => {
    const PFactory = await ethers.getContractFactory('PFactory')
    const PRouter = await ethers.getContractFactory('PRouter')
    const StateManager = await ethers.getContractFactory('StateManager')
    const StandardToken = await ethers.getContractFactory('StandardToken')
    const TestReceiver = await ethers.getContractFactory('TestReceiver')
    const TestNotReceiver = await ethers.getContractFactory('TestNotReceiver')

    const signers = await ethers.getSigners()
    owner = signers[0]
    relayer = signers[1]
    user1 = signers[2]

    // H A R D H A T
    testReceiver = await TestReceiver.deploy()
    testNotReceiver = await TestNotReceiver.deploy()
    pFactory = await PFactory.deploy()
    pRouter = await PRouter.deploy(pFactory.address)
    stateManager = await StateManager.deploy(pFactory.address, QUEUE_TIME)
    token = await StandardToken.deploy('Token', 'TKN', 18, ethers.utils.parseEther('100000000'))

    await pFactory.setRouter(pRouter.address)
    await pFactory.setStateManager(stateManager.address)
    await pFactory.renounceOwnership()

    pToken = await deployPToken(
      await token.name(),
      await token.symbol(),
      await token.decimals(),
      token.address,
      PNETWORK_NETWORK_IDS.hardhat,
      {
        pFactory,
      }
    )
  })

  it('should ', async () => {})
})
