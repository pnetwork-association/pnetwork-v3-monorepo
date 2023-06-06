const { expect } = require('chai')
const { ethers } = require('hardhat')
const { time } = require('@nomicfoundation/hardhat-network-helpers')

const {
  QUEUE_TIME,
  PNETWORK_NETWORK_IDS,
  ZERO_ADDRESS,
  TELEPATHY_ROUTER_ADDRESS,
} = require('./constants')
const { deployPToken, getOptionMaskWithOptionEnabledForBit } = require('./utils')
const Operation = require('./utils/Operation')

let token,
  owner,
  pToken,
  pRouter,
  pFactory,
  stateManager,
  guardian,
  sentinel,
  relayer,
  testReceiver,
  testNotReceiver,
  user1,
  epochsManager,
  telepathyRouter,
  fakeGovernanceMessageVerifier,
  epochDuration

describe('StateManager', () => {
  const generateOperation = async (_opts = {}) => {
    const {
      destinationAccount = owner.address,
      destinationNetworkId = PNETWORK_NETWORK_IDS.hardhat,
      underlyingAssetName = await token.name(),
      underlyingAssetSymbol = await token.symbol(),
      underlyingAssetDecimals = await token.decimals(),
      underlyingAssetTokenAddress = token.address,
      underlyingAssetNetworkId = PNETWORK_NETWORK_IDS.hardhat,
      assetTokenAddress = token.address,
      assetAmount = ethers.utils.parseEther('1000'),
      userData = '0x',
      optionsMask = '0x'.padEnd(66, '0'),
    } = _opts

    await token.approve(pToken.address, assetAmount)
    const transaction = pRouter.userSend(
      destinationAccount,
      destinationNetworkId,
      underlyingAssetName,
      underlyingAssetSymbol,
      underlyingAssetDecimals,
      underlyingAssetTokenAddress,
      underlyingAssetNetworkId,
      assetTokenAddress,
      assetAmount,
      userData,
      optionsMask
    )
    await expect(transaction).to.emit(pRouter, 'UserOperation')

    const nonce = 1
    const { blockHash, transactionHash } = await (await transaction).wait()

    return new Operation({
      originBlockHash: blockHash,
      originTransactionHash: transactionHash,
      optionsMask,
      nonce,
      underlyingAssetDecimals,
      assetAmount,
      underlyingAssetTokenAddress: token.address,
      originNetworkId: PNETWORK_NETWORK_IDS.hardhat,
      destinationNetworkId,
      underlyingAssetNetworkId,
      destinationAccount,
      underlyingAssetName,
      underlyingAssetSymbol,
      userData,
    })
  }

  beforeEach(async () => {
    // eslint-disable-next-line no-undef
    await network.provider.request({
      method: 'hardhat_reset',
    })
    const chainId = (await ethers.provider.getNetwork()).chainId

    const PFactory = await ethers.getContractFactory('PFactory')
    const PRouter = await ethers.getContractFactory('PRouter')
    const StateManager = await ethers.getContractFactory('StateManager')
    const StandardToken = await ethers.getContractFactory('StandardToken')
    const TestReceiver = await ethers.getContractFactory('TestReceiver')
    const TestNotReceiver = await ethers.getContractFactory('TestNotReceiver')
    const EpochsManager = await ethers.getContractFactory('EpochsManager')

    const signers = await ethers.getSigners()
    owner = signers[0]
    relayer = signers[1]
    user1 = signers[2]
    guardian = signers[3]
    sentinel = signers[4]
    fakeGovernanceMessageVerifier = signers[5]

    // H A R D H A T
    testReceiver = await TestReceiver.deploy()
    pFactory = await PFactory.deploy()
    testNotReceiver = await TestNotReceiver.deploy()
    pRouter = await PRouter.deploy(pFactory.address)
    epochsManager = await EpochsManager.deploy()
    stateManager = await StateManager.deploy(
      pFactory.address,
      QUEUE_TIME,
      epochsManager.address,
      TELEPATHY_ROUTER_ADDRESS,
      fakeGovernanceMessageVerifier.address,
      chainId
    )
    token = await StandardToken.deploy('Token', 'TKN', 18, ethers.utils.parseEther('100000000'))
    telepathyRouter = await ethers.getImpersonatedSigner(TELEPATHY_ROUTER_ADDRESS)

    epochDuration = (await epochsManager.epochDuration()).toNumber()

    await owner.sendTransaction({
      to: telepathyRouter.address,
      value: ethers.utils.parseEther('1'),
    })

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

    // NOTE: mock
    const epoch = await epochsManager.currentEpoch() // NOTE: should be next epoch but to simplify testing we use the current one
    const coder = new ethers.utils.AbiCoder()
    const data =
      '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a0' +
      coder
        .encode(
          ['bytes32', 'bytes'],
          [
            '0x0abea1e3e92cf48dbad75e3c6f731e5ef04a7a2bff451ae7ed39d6eee2bcb0e7',
            coder.encode(
              ['uint16', 'bytes32'],
              [epoch, '0xa4896a3f93bf4bf58378e579f3cf193bb4af1022af7d2089f37d8bae7157b85f']
            ),
          ]
        )
        .slice(2)
    await stateManager
      .connect(telepathyRouter)
      .handleTelepathy(chainId, fakeGovernanceMessageVerifier.address, data)
  })

  it('should be able to queue an operation', async () => {
    const operation = await generateOperation()

    await expect(stateManager.connect(relayer).protocolQueueOperation(operation))
      .to.emit(stateManager, 'OperationQueued')
      .withArgs(operation.serialize())
  })

  it('should not be able to queue the same operation twice', async () => {
    const operation = await generateOperation()
    await stateManager.connect(relayer).protocolQueueOperation(operation)
    await expect(
      stateManager.connect(relayer).protocolQueueOperation(operation)
    ).to.be.revertedWithCustomError(stateManager, 'OperationAlreadyQueued')
  })

  it('a guardian should be able to cancel an operation within the challenge period', async () => {
    const operation = await generateOperation()
    await stateManager.connect(relayer).protocolQueueOperation(operation)
    await time.increase(QUEUE_TIME / 2)
    await expect(stateManager.connect(relayer).protocolGuardianCancelOperation(operation))
      .to.emit(stateManager, 'GuardianOperationCancelled')
      .withArgs(operation.serialize())
  })

  it('a guardian should not be able to cancel an operation after the challenge period', async () => {
    const operation = await generateOperation()
    await stateManager.connect(relayer).protocolQueueOperation(operation)
    await time.increase(QUEUE_TIME)
    await expect(
      stateManager.connect(relayer).protocolGuardianCancelOperation(operation)
    ).to.be.revertedWithCustomError(stateManager, 'ChallengePeriodTerminated')
  })

  it('a guardian should not be able to cancel an operation that has not been queued', async () => {
    const fakeOperation = new Operation()
    await expect(
      stateManager.connect(relayer).protocolGuardianCancelOperation(fakeOperation)
    ).to.be.revertedWithCustomError(stateManager, 'OperationNotQueued')
  })

  it('should not be able to execute an operation that has not been queued', async () => {
    const fakeOperation = new Operation()
    await expect(
      stateManager.connect(relayer).protocolExecuteOperation(fakeOperation)
    ).to.be.revertedWithCustomError(stateManager, 'OperationNotQueued')
  })

  it('should not be able to execute an operation that has been cancelled', async () => {
    // FIXME
    const proof = [0]
    const operation = await generateOperation()
    await stateManager.connect(relayer).protocolQueueOperation(operation)
    await stateManager.connect(guardian).protocolGuardianCancelOperation(operation)
    await stateManager.connect(sentinel).protocolGovernanceCancelOperation(operation, proof)
    await expect(
      stateManager.connect(relayer).protocolExecuteOperation(operation)
    ).to.be.revertedWithCustomError(stateManager, 'OperationAlreadyCancelled')
  })

  it('should not be able to execute an operation before that the execution timestamp is reached', async () => {
    const operation = await generateOperation()
    await stateManager.connect(relayer).protocolQueueOperation(operation)
    await expect(
      stateManager.connect(relayer).protocolExecuteOperation(operation)
    ).to.be.revertedWithCustomError(stateManager, 'ChallengePeriodNotTerminated')
  })

  it('should be able to execute an operation', async () => {
    const operation = await generateOperation()
    const balancePre = await pToken.balanceOf(operation.destinationAccount)
    await stateManager.connect(relayer).protocolQueueOperation(operation)
    await time.increase(QUEUE_TIME)
    await expect(stateManager.connect(relayer).protocolExecuteOperation(operation))
      .to.emit(stateManager, 'OperationExecuted')
      .withArgs(operation.serialize())
      .and.to.emit(pToken, 'Transfer')
      .withArgs(ZERO_ADDRESS, operation.destinationAccount, operation.assetAmount)
    const balancePost = await pToken.balanceOf(operation.destinationAccount)
    expect(balancePost).to.be.eq(balancePre.add(operation.assetAmount))
  })

  it('should be able to execute an operation and call stateManagedProtocolBurn', async () => {
    const operation = await generateOperation({
      optionsMask: getOptionMaskWithOptionEnabledForBit(0),
    })
    await stateManager.connect(relayer).protocolQueueOperation(operation)
    await time.increase(QUEUE_TIME)
    await expect(stateManager.connect(relayer).protocolExecuteOperation(operation))
      .to.emit(stateManager, 'OperationExecuted')
      .withArgs(operation.serialize())
      .and.to.emit(pToken, 'Transfer')
      .withArgs(ZERO_ADDRESS, operation.destinationAccount, operation.assetAmount)
      .and.to.emit(pToken, 'Transfer')
      .withArgs(operation.destinationAccount, ZERO_ADDRESS, operation.assetAmount)
      .and.to.emit(token, 'Transfer')
      .withArgs(pToken.address, operation.destinationAccount, operation.assetAmount)
  })

  it('should not be able to execute the same operation twice', async () => {
    const operation = await generateOperation()
    await stateManager.connect(relayer).protocolQueueOperation(operation)
    await time.increase(QUEUE_TIME)
    await stateManager.connect(relayer).protocolExecuteOperation(operation)
    await expect(
      stateManager.connect(relayer).protocolExecuteOperation(operation)
    ).to.be.revertedWithCustomError(stateManager, 'OperationAlreadyExecuted')
  })

  it('should be able to execute an operation that contains user data', async () => {
    const expectedUserData = '0x01'
    const operation = await generateOperation({
      userData: expectedUserData,
      destinationAccount: testReceiver.address,
    })
    await stateManager.connect(relayer).protocolQueueOperation(operation)
    await time.increase(QUEUE_TIME)
    await expect(stateManager.connect(relayer).protocolExecuteOperation(operation))
      .to.emit(stateManager, 'OperationExecuted')
      .withArgs(operation.serialize())
      .and.to.emit(testReceiver, 'UserDataReceived')
      .withArgs(expectedUserData)
  })

  it('should be able to execute an operation that contains user data despite the receiver is a contract that does extends from PReceiver', async () => {
    const operation = await generateOperation({
      userData: '0x01',
      destinationAccount: testNotReceiver.address,
    })
    await stateManager.connect(relayer).protocolQueueOperation(operation)
    await time.increase(QUEUE_TIME)
    await expect(stateManager.connect(relayer).protocolExecuteOperation(operation))
      .to.emit(stateManager, 'OperationExecuted')
      .withArgs(operation.serialize())
  })

  it('should not be able to execute an operation that contains user data and the receiver is an EOA', async () => {
    const operation = await generateOperation({
      userData: '0x01',
      destinationAccount: user1.address,
    })
    await stateManager.connect(relayer).protocolQueueOperation(operation)
    await time.increase(QUEUE_TIME)
    await expect(
      stateManager.connect(relayer).protocolExecuteOperation(operation)
    ).to.be.revertedWithCustomError(stateManager, 'NotContract')
  })

  it('should not be able to queue an operation because the sentinels root for the current epoch has not been received yet', async () => {
    await time.increase(epochDuration)
    const operation = await generateOperation({
      userData: '0x01',
      destinationAccount: user1.address,
    })
    await expect(
      stateManager.connect(relayer).protocolQueueOperation(operation)
    ).to.be.revertedWithCustomError(stateManager, 'LockDown')
  })

  it('should not be able to execute an operation because the sentinels root for the current epoch has not been received yet', async () => {
    const operation = await generateOperation({
      userData: '0x01',
      destinationAccount: user1.address,
    })
    await stateManager.connect(relayer).protocolQueueOperation(operation)
    await time.increase(epochDuration)
    await expect(
      stateManager.connect(relayer).protocolExecuteOperation(operation)
    ).to.be.revertedWithCustomError(stateManager, 'LockDown')
  })

  it('should not be able to queue an operation because is missing less than 1 hour and 20 minutes', async () => {
    const currentEpoch = await epochsManager.currentEpoch()
    const startFirstEpochTimestamp = (await epochsManager.startFirstEpochTimestamp()).toNumber()
    const currentEpochEndTimestamp = startFirstEpochTimestamp + (currentEpoch + 1) * epochDuration
    await time.increaseTo(currentEpochEndTimestamp - (3600 + 1200))
    const operation = await generateOperation({
      userData: '0x01',
      destinationAccount: user1.address,
    })
    await expect(
      stateManager.connect(relayer).protocolQueueOperation(operation)
    ).to.be.revertedWithCustomError(stateManager, 'LockDown')
  })

  it('should not be able to execute an operation because is missing less then 1 hour before the ending of the current epoch', async () => {
    const operation = await generateOperation({
      userData: '0x01',
      destinationAccount: user1.address,
    })
    await stateManager.connect(relayer).protocolQueueOperation(operation)

    const currentEpoch = await epochsManager.currentEpoch()
    const startFirstEpochTimestamp = (await epochsManager.startFirstEpochTimestamp()).toNumber()
    const currentEpochEndTimestamp = startFirstEpochTimestamp + (currentEpoch + 1) * epochDuration
    await time.increaseTo(currentEpochEndTimestamp - 1800)

    await expect(
      stateManager.connect(relayer).protocolExecuteOperation(operation)
    ).to.be.revertedWithCustomError(stateManager, 'LockDown')
  })
})
