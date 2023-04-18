const { expect } = require('chai')
const { ethers } = require('hardhat')
const { time } = require('@nomicfoundation/hardhat-network-helpers')

const { QUEUE_TIME, PNETWORK_NETWORK_IDS } = require('./constants')
const { deployPToken } = require('./utils')

let token, owner, pToken, pRouter, pFactory, stateManager

describe('PToken', () => {
  beforeEach(async () => {
    const PFactory = await ethers.getContractFactory('PFactory')
    const PRouter = await ethers.getContractFactory('PRouter')
    const StateManager = await ethers.getContractFactory('StateManager')
    const StandardToken = await ethers.getContractFactory('StandardToken')

    const signers = await ethers.getSigners()
    owner = signers[0]
    // relayer = signers[1]

    // H A R D H A T
    pFactory = await PFactory.deploy()
    pRouter = await PRouter.deploy(pFactory.address)
    stateManager = await StateManager.deploy(pFactory.address, QUEUE_TIME)
    token = await StandardToken.deploy(
      'Token',
      'TKN',
      ethers.utils.parseEther('100000000')
    )

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

  it('should be able to handle an operation', async () => {
    const amount = ethers.utils.parseEther('1000')
    await token.approve(pToken.address, amount)
    const transaction = pRouter.userSend(
      owner.address,
      PNETWORK_NETWORK_IDS.hardhat,
      await token.name(),
      await token.symbol(),
      await token.decimals(),
      token.address,
      PNETWORK_NETWORK_IDS.hardhat,
      token.address,
      amount,
      '0x',
      '0x'.padEnd(66, '0')
    )
    await expect(transaction).to.emit(pRouter, 'UserOperation')

    // NOTE: no need to get it from the event in these tests
    const nonce = 1
    const { blockHash, transactionHash } = await (await transaction).wait()

    const operation = [
      blockHash,
      transactionHash,
      '0x'.padEnd(66, '0'),
      nonce,
      await token.decimals(),
      amount,
      token.address,
      PNETWORK_NETWORK_IDS.hardhat,
      PNETWORK_NETWORK_IDS.hardhat,
      PNETWORK_NETWORK_IDS.hardhat,
      owner.address,
      await token.name(),
      await token.symbol(),
      '0x',
    ]

    // simulate relayer
    await expect(stateManager.protocolQueueOperation(operation)).to.emit(
      stateManager,
      'OperationQueued'
    )
    await time.increase(QUEUE_TIME)
    await expect(stateManager.protocolExecuteOperation(operation)).to.emit(
      stateManager,
      'OperationExecuted'
    )
  })
})
