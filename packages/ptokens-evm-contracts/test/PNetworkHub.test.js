const { expect } = require('chai')
const { ethers } = require('hardhat')
const { time } = require('@nomicfoundation/hardhat-network-helpers')

const {
  K_CHALLENGE_PERIOD,
  LOCKED_AMOUNT_CHALLENGE_PERIOD,
  PNETWORK_NETWORK_IDS,
  BASE_CHALLENGE_PERIOD_DURATION,
  TELEPATHY_ROUTER_ADDRESS,
  ZERO_ADDRESS,
  MAX_OPERATIONS_IN_QUEUE,
} = require('./constants')
const { deployPToken, getOptionMaskWithOptionEnabledForBit } = require('./utils')
const Operation = require('./utils/Operation')

let token,
  owner,
  pToken,
  pTokenInterim,
  pFactory,
  hub,
  hubInterim,
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

describe('PNetworkHub', () => {
  const generateOperation = async (_opts = {}, _hub = hub) => {
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
      protocolFeeAssetTokenAddress = ZERO_ADDRESS,
      protocolFeeAssetAmount = '0',
      userData = '0x',
      optionsMask = '0x'.padEnd(66, '0'),
    } = _opts

    if (_hub.address === hub.address) {
      await token.approve(pToken.address, assetAmount)
    } else if (_hub.address === hubInterim.address) {
      await token.approve(pTokenInterim.address, assetAmount)
    }

    const transaction = _hub.userSend(
      destinationAccount,
      destinationNetworkId,
      underlyingAssetName,
      underlyingAssetSymbol,
      underlyingAssetDecimals,
      underlyingAssetTokenAddress,
      underlyingAssetNetworkId,
      assetTokenAddress,
      assetAmount,
      protocolFeeAssetTokenAddress,
      protocolFeeAssetAmount,
      userData,
      optionsMask
    )
    await expect(transaction).to.emit(_hub, 'UserOperation')

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
      protocolFeeAssetAmount: '0',
      forwardDestinationNetworkId: PNETWORK_NETWORK_IDS.ethereumMainnet,
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
    const PNetworkHub = await ethers.getContractFactory('PNetworkHub')
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
    epochsManager = await EpochsManager.deploy()
    hubInterim = await PNetworkHub.deploy(
      pFactory.address,
      BASE_CHALLENGE_PERIOD_DURATION,
      epochsManager.address,
      TELEPATHY_ROUTER_ADDRESS,
      fakeGovernanceMessageVerifier.address,
      chainId,
      LOCKED_AMOUNT_CHALLENGE_PERIOD,
      K_CHALLENGE_PERIOD,
      MAX_OPERATIONS_IN_QUEUE,
      PNETWORK_NETWORK_IDS.hardhat
    )
    hub = await PNetworkHub.deploy(
      pFactory.address,
      BASE_CHALLENGE_PERIOD_DURATION,
      epochsManager.address,
      TELEPATHY_ROUTER_ADDRESS,
      fakeGovernanceMessageVerifier.address,
      chainId,
      LOCKED_AMOUNT_CHALLENGE_PERIOD,
      K_CHALLENGE_PERIOD,
      MAX_OPERATIONS_IN_QUEUE,
      PNETWORK_NETWORK_IDS.ethereumMainnet
    )

    token = await StandardToken.deploy('Token', 'TKN', 18, ethers.utils.parseEther('100000000'))
    telepathyRouter = await ethers.getImpersonatedSigner(TELEPATHY_ROUTER_ADDRESS)

    epochDuration = (await epochsManager.epochDuration()).toNumber()

    await owner.sendTransaction({
      to: telepathyRouter.address,
      value: ethers.utils.parseEther('1'),
    })

    await pFactory.setHub(hub.address)
    // await pFactory.renounceOwnership()

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

    await pFactory.setHub(hubInterim.address)
    pTokenInterim = await deployPToken(
      await token.name(),
      await token.symbol(),
      await token.decimals(),
      token.address,
      PNETWORK_NETWORK_IDS.hardhat,
      {
        pFactory,
      }
    )

    await pFactory.setHub(hub.address)

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
    await hub
      .connect(telepathyRouter)
      .handleTelepathy(chainId, fakeGovernanceMessageVerifier.address, data)

    await hubInterim
      .connect(telepathyRouter)
      .handleTelepathy(chainId, fakeGovernanceMessageVerifier.address, data)
  })

  it('should be able to queue an operation', async () => {
    const operation = await generateOperation()

    const relayerbalancePre = await ethers.provider.getBalance(relayer.address)
    const tx = hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await expect(tx).to.emit(hub, 'OperationQueued').withArgs(operation.serialize())

    const receipt = await (await tx).wait(1)
    const relayerbalancePost = await ethers.provider.getBalance(relayer.address)
    expect(relayerbalancePost).to.be.eq(
      relayerbalancePre
        .sub(LOCKED_AMOUNT_CHALLENGE_PERIOD)
        .sub(receipt.gasUsed.mul(receipt.effectiveGasPrice))
    )
  })

  it('should not be able to queue the same operation twice', async () => {
    const operation = await generateOperation()
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await expect(
      hub
        .connect(relayer)
        .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    ).to.be.revertedWithCustomError(hub, 'OperationAlreadyQueued')
  })

  it('a guardian should be able to cancel an operation within the challenge period', async () => {
    const operation = await generateOperation()
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await time.increase((await hub.getCurrentChallengePeriodDuration()) / 2)
    await expect(hub.connect(relayer).protocolGuardianCancelOperation(operation, '0x'))
      .to.emit(hub, 'GuardianOperationCancelled')
      .withArgs(operation.serialize())
  })

  it('a guardian should not be able to cancel an operation after the challenge period', async () => {
    const operation = await generateOperation()
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await time.increase(await hub.getCurrentChallengePeriodDuration())
    await expect(
      hub.connect(relayer).protocolGuardianCancelOperation(operation, '0x')
    ).to.be.revertedWithCustomError(hub, 'ChallengePeriodTerminated')
  })

  it('a guardian should not be able to cancel an operation that has not been queued', async () => {
    const fakeOperation = new Operation()
    await expect(
      hub.connect(relayer).protocolGuardianCancelOperation(fakeOperation, '0x')
    ).to.be.revertedWithCustomError(hub, 'OperationNotQueued')
  })

  it('should not be able to execute an operation that has not been queued', async () => {
    const fakeOperation = new Operation()
    await expect(
      hub.connect(relayer).protocolExecuteOperation(fakeOperation)
    ).to.be.revertedWithCustomError(hub, 'OperationNotQueued')
  })

  it('should not be able to execute an operation that has been cancelled', async () => {
    // FIXME
    const proof = [0]
    const operation = await generateOperation()
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await hub.connect(guardian).protocolGuardianCancelOperation(operation, '0x')
    await hub.connect(sentinel).protocolGovernanceCancelOperation(operation, proof)
    await expect(
      hub.connect(relayer).protocolExecuteOperation(operation)
    ).to.be.revertedWithCustomError(hub, 'OperationAlreadyCancelled')
  })

  it('should not be able to execute an operation before that the execution timestamp is reached', async () => {
    const operation = await generateOperation()
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await expect(
      hub.connect(relayer).protocolExecuteOperation(operation)
    ).to.be.revertedWithCustomError(hub, 'ChallengePeriodNotTerminated')
  })

  it('should be able to execute an operation on the destination chain', async () => {
    const operation = await generateOperation()
    const relayerbalancePre = await ethers.provider.getBalance(relayer.address)
    const destinationAccountbalancePre = await pToken.balanceOf(operation.destinationAccount)

    let tx = await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    const receipt1 = await tx.wait(1)

    await time.increase(await hub.getCurrentChallengePeriodDuration())

    tx = hub.connect(relayer).protocolExecuteOperation(operation)
    await expect(tx)
      .to.emit(hub, 'OperationExecuted')
      .withArgs(operation.serialize())
      .and.to.emit(pToken, 'Transfer')
      .withArgs(ZERO_ADDRESS, operation.destinationAccount, operation.assetAmount)
    const receipt2 = await (await tx).wait(1)

    const relayerbalancePost = await ethers.provider.getBalance(relayer.address)
    const destinationAccountbalancePost = await pToken.balanceOf(operation.destinationAccount)

    expect(destinationAccountbalancePost).to.be.eq(
      destinationAccountbalancePre.add(operation.assetAmount)
    )

    expect(relayerbalancePost).to.be.eq(
      relayerbalancePre
        .sub(receipt1.gasUsed.mul(receipt1.effectiveGasPrice))
        .sub(receipt2.gasUsed.mul(receipt2.effectiveGasPrice))
    )
  })

  it('should be able to execute an operation on the interim chain', async () => {
    await pFactory.setHub(hubInterim.address)
    const operation = await generateOperation(undefined, hubInterim)
    const relayerbalancePre = await ethers.provider.getBalance(relayer.address)

    let tx = await hubInterim
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    const receipt1 = await tx.wait(1)

    await time.increase(await hubInterim.getCurrentChallengePeriodDuration())

    tx = hubInterim.connect(relayer).protocolExecuteOperation(operation)
    await expect(tx).to.emit(hubInterim, 'UserOperation').and.to.emit(pTokenInterim, 'Transfer')
    // TODO: .withArgs(ZERO_ADDRESS, dao.address, amountWithoutFee)
    const receipt2 = await (await tx).wait(1)

    const relayerbalancePost = await ethers.provider.getBalance(relayer.address)
    const destinationAccountbalancePost = await pToken.balanceOf(operation.destinationAccount)

    expect(destinationAccountbalancePost).to.be.eq(0)

    expect(relayerbalancePost).to.be.eq(
      relayerbalancePre
        .sub(receipt1.gasUsed.mul(receipt1.effectiveGasPrice))
        .sub(receipt2.gasUsed.mul(receipt2.effectiveGasPrice))
    )
  })

  it('should be able to execute an operation and call protocolBurn', async () => {
    const operation = await generateOperation({
      optionsMask: getOptionMaskWithOptionEnabledForBit(0),
    })
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await time.increase(await hub.getCurrentChallengePeriodDuration())
    await expect(hub.connect(relayer).protocolExecuteOperation(operation))
      .to.emit(hub, 'OperationExecuted')
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
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await time.increase(await hub.getCurrentChallengePeriodDuration())
    await hub.connect(relayer).protocolExecuteOperation(operation)
    await expect(
      hub.connect(relayer).protocolExecuteOperation(operation)
    ).to.be.revertedWithCustomError(hub, 'OperationAlreadyExecuted')
  })

  it('should be able to execute an operation that contains user data', async () => {
    const expectedUserData = '0x01'
    const operation = await generateOperation({
      userData: expectedUserData,
      destinationAccount: testReceiver.address,
    })
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await time.increase(await hub.getCurrentChallengePeriodDuration())
    await expect(hub.connect(relayer).protocolExecuteOperation(operation))
      .to.emit(hub, 'OperationExecuted')
      .withArgs(operation.serialize())
      .and.to.emit(testReceiver, 'UserDataReceived')
      .withArgs(expectedUserData)
  })

  it('should be able to execute an operation that contains user data despite the receiver is a contract that does extends from PReceiver', async () => {
    const operation = await generateOperation({
      userData: '0x01',
      destinationAccount: testNotReceiver.address,
    })
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await time.increase(await hub.getCurrentChallengePeriodDuration())
    await expect(hub.connect(relayer).protocolExecuteOperation(operation))
      .to.emit(hub, 'OperationExecuted')
      .withArgs(operation.serialize())
  })

  it('should not be able to execute an operation that contains user data and the receiver is an EOA', async () => {
    const operation = await generateOperation({
      userData: '0x01',
      destinationAccount: user1.address,
    })
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await time.increase(await hub.getCurrentChallengePeriodDuration())
    await expect(
      hub.connect(relayer).protocolExecuteOperation(operation)
    ).to.be.revertedWithCustomError(hub, 'NotContract')
  })

  it('should not be able to queue an operation because the sentinels root for the current epoch has not been received yet', async () => {
    await time.increase(epochDuration)
    const operation = await generateOperation({
      userData: '0x01',
      destinationAccount: user1.address,
    })
    await expect(
      hub
        .connect(relayer)
        .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    ).to.be.revertedWithCustomError(hub, 'LockDown')
  })

  it('should not be able to execute an operation because the sentinels root for the current epoch has not been received yet', async () => {
    const operation = await generateOperation({
      userData: '0x01',
      destinationAccount: user1.address,
    })
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await time.increase(epochDuration)
    await expect(
      hub.connect(relayer).protocolExecuteOperation(operation)
    ).to.be.revertedWithCustomError(hub, 'LockDown')
  })

  it('should not be able to queue an operation because is missing less than 1 hour plus max challenge period', async () => {
    const currentEpoch = await epochsManager.currentEpoch()
    const startFirstEpochTimestamp = (await epochsManager.startFirstEpochTimestamp()).toNumber()
    const currentEpochEndTimestamp = startFirstEpochTimestamp + (currentEpoch + 1) * epochDuration

    const maxChallengePeriod =
      BASE_CHALLENGE_PERIOD_DURATION +
      MAX_OPERATIONS_IN_QUEUE * MAX_OPERATIONS_IN_QUEUE * K_CHALLENGE_PERIOD -
      K_CHALLENGE_PERIOD
    await time.increaseTo(currentEpochEndTimestamp - (3600 + maxChallengePeriod))
    const operation = await generateOperation()
    await expect(
      hub
        .connect(relayer)
        .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    ).to.be.revertedWithCustomError(hub, 'LockDown')
  })

  it('should not be able to execute an operation because is missing less then 1 hour before the ending of the current epoch', async () => {
    const operation = await generateOperation()
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })

    const currentEpoch = await epochsManager.currentEpoch()
    const startFirstEpochTimestamp = (await epochsManager.startFirstEpochTimestamp()).toNumber()
    const currentEpochEndTimestamp = startFirstEpochTimestamp + (currentEpoch + 1) * epochDuration
    await time.increaseTo(currentEpochEndTimestamp - 1800)

    await expect(
      hub.connect(relayer).protocolExecuteOperation(operation)
    ).to.be.revertedWithCustomError(hub, 'LockDown')
  })

  it('the queue should behave correctly when is full and then all operations are cancelled', async () => {
    const operations = []

    for (
      let numberOfOperations = 1;
      numberOfOperations <= MAX_OPERATIONS_IN_QUEUE;
      numberOfOperations++
    ) {
      const operation = await generateOperation()
      await hub
        .connect(relayer)
        .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })

      const [startTimestamp, endTimestamp] = await hub.challengePeriodOf(operation)
      const expectedCurrentChallengePeriodDuration =
        BASE_CHALLENGE_PERIOD_DURATION +
        numberOfOperations * numberOfOperations * K_CHALLENGE_PERIOD -
        K_CHALLENGE_PERIOD
      expect(expectedCurrentChallengePeriodDuration).to.be.eq(endTimestamp.sub(startTimestamp))

      operations.push(operation)
    }

    await expect(
      hub.connect(relayer).protocolQueueOperation(await generateOperation(), {
        value: LOCKED_AMOUNT_CHALLENGE_PERIOD,
      })
    ).to.be.revertedWithCustomError(hub, 'QueueFull')

    expect(await hub.numberOfOperationsInQueue()).to.be.eq(MAX_OPERATIONS_IN_QUEUE)

    for (
      let index = 0, numberOfOperations = MAX_OPERATIONS_IN_QUEUE;
      index < MAX_OPERATIONS_IN_QUEUE;
      index++, numberOfOperations--
    ) {
      const operation = operations[index]
      const [startTimestamp, endTimestamp] = await hub.challengePeriodOf(operation)

      const expectedCurrentChallengePeriodDuration =
        BASE_CHALLENGE_PERIOD_DURATION +
        numberOfOperations * numberOfOperations * K_CHALLENGE_PERIOD -
        K_CHALLENGE_PERIOD
      expect(expectedCurrentChallengePeriodDuration).to.be.eq(endTimestamp.sub(startTimestamp))

      await hub.connect(guardian).protocolGuardianCancelOperation(operation, '0x')
      await hub.connect(sentinel).protocolGovernanceCancelOperation(operation, [0])
    }
  })

  it('the queue should behave correctly when is full and then all operations are executed', async () => {
    const operations = []

    for (
      let numberOfOperations = 1;
      numberOfOperations <= MAX_OPERATIONS_IN_QUEUE;
      numberOfOperations++
    ) {
      const operation = await generateOperation()
      await hub
        .connect(relayer)
        .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
      operations.push(operation)
    }

    for (
      let index = 0, numberOfOperations = MAX_OPERATIONS_IN_QUEUE;
      index < MAX_OPERATIONS_IN_QUEUE;
      index++, numberOfOperations--
    ) {
      const operation = operations[index]
      const [startTimestamp, endTimestamp] = await hub.challengePeriodOf(operation)

      const expectedCurrentChallengePeriodDuration =
        BASE_CHALLENGE_PERIOD_DURATION +
        numberOfOperations * numberOfOperations * K_CHALLENGE_PERIOD -
        K_CHALLENGE_PERIOD
      expect(expectedCurrentChallengePeriodDuration).to.be.eq(endTimestamp.sub(startTimestamp))

      if (endTimestamp > (await time.latest())) {
        await time.increaseTo(endTimestamp)
      }

      await hub.connect(relayer).protocolExecuteOperation(operation)
    }
  })

  it('should be able to call userSend to wrap only tokens', async () => {
    const assetAmount = ethers.utils.parseEther('1000')
    const data = {
      destinationAccount: owner.address,
      destinationNetworkId: PNETWORK_NETWORK_IDS.ethereumMainnet,
      underlyingAssetName: await token.name(),
      underlyingAssetSymbol: await token.symbol(),
      underlyingAssetDecimals: await token.decimals(),
      underlyingAssetTokenAddress: token.address,
      underlyingAssetNetworkId: PNETWORK_NETWORK_IDS.hardhat,
      assetTokenAddress: token.address,
      assetAmount,
      protocolFeeAssetTokenAddress: ZERO_ADDRESS,
      protocolFeeAssetAmount: '0',
      userData: '0x',
      optionsMask: '0x'.padEnd(66, '0'),
    }

    await token.approve(pToken.address, assetAmount)
    await expect(hub.userSend(...Object.values(data))).to.emit(hub, 'UserOperation')
  })

  it('should not be able to call userSend to wrap only tokens specifying protocolFeeAssetAmount or protocolFeeAssetTokenAddress or protocolFeeAssetAmount and protocolFeeAssetTokenAddress', async () => {
    const assetAmount = ethers.utils.parseEther('1000')
    const data = {
      destinationAccount: owner.address,
      destinationNetworkId: PNETWORK_NETWORK_IDS.ethereumMainnet,
      underlyingAssetName: await token.name(),
      underlyingAssetSymbol: await token.symbol(),
      underlyingAssetDecimals: await token.decimals(),
      underlyingAssetTokenAddress: token.address,
      underlyingAssetNetworkId: PNETWORK_NETWORK_IDS.hardhat,
      assetTokenAddress: token.address,
      assetAmount,
      protocolFeeAssetTokenAddress: ZERO_ADDRESS,
      protocolFeeAssetAmount: assetAmount,
      userData: '0x',
      optionsMask: '0x'.padEnd(66, '0'),
    }
    await expect(hub.userSend(...Object.values(data))).to.be.revertedWithCustomError(
      hub,
      'InvalidProtocolFeeAssetParameters'
    )

    data.protocolFeeAssetAmount = '0'
    data.protocolFeeAssetTokenAddress = token.address
    await expect(hub.userSend(...Object.values(data))).to.be.revertedWithCustomError(
      hub,
      'InvalidProtocolFeeAssetParameters'
    )

    data.protocolFeeAssetAmount = assetAmount
    await expect(hub.userSend(...Object.values(data))).to.be.revertedWithCustomError(
      hub,
      'InvalidProtocolFeeAssetParameters'
    )
  })

  it('should be able to call userSend to send userData', async () => {
    const protocolFeeAssetAmount = ethers.utils.parseEther('1000')
    const data = {
      destinationAccount: owner.address,
      destinationNetworkId: PNETWORK_NETWORK_IDS.ethereumMainnet,
      underlyingAssetName: await token.name(),
      underlyingAssetSymbol: await token.symbol(),
      underlyingAssetDecimals: await token.decimals(),
      underlyingAssetTokenAddress: token.address,
      underlyingAssetNetworkId: PNETWORK_NETWORK_IDS.hardhat,
      assetTokenAddress: ZERO_ADDRESS,
      assetAmount: '0',
      protocolFeeAssetTokenAddress: token.address,
      protocolFeeAssetAmount,
      userData: '0x00',
      optionsMask: '0x'.padEnd(66, '0'),
    }

    await token.approve(pToken.address, protocolFeeAssetAmount)
    await expect(hub.userSend(...Object.values(data))).to.emit(hub, 'UserOperation')
  })

  it('should not be able to call userSend to send userData specifying assetAmount or assetTokenAddress or and assetTokenAddress and assetTokenAmount', async () => {
    const protocolFeeAssetAmount = ethers.utils.parseEther('1000')
    const data = {
      destinationAccount: owner.address,
      destinationNetworkId: PNETWORK_NETWORK_IDS.ethereumMainnet,
      underlyingAssetName: await token.name(),
      underlyingAssetSymbol: await token.symbol(),
      underlyingAssetDecimals: await token.decimals(),
      underlyingAssetTokenAddress: token.address,
      underlyingAssetNetworkId: PNETWORK_NETWORK_IDS.hardhat,
      assetTokenAddress: token.address,
      assetAmount: '1',
      protocolFeeAssetTokenAddress: token.address,
      protocolFeeAssetAmount,
      userData: '0x00',
      optionsMask: '0x'.padEnd(66, '0'),
    }

    await expect(hub.userSend(...Object.values(data))).to.be.revertedWithCustomError(
      hub,
      'InvalidProtocolFeeAssetParameters'
    )

    data.assetAmount = '0'
    await expect(hub.userSend(...Object.values(data))).to.be.revertedWithCustomError(
      hub,
      'InvalidAssetParameters'
    )

    data.assetAmount = '1'
    data.assetTokenAddress = ZERO_ADDRESS
    await expect(hub.userSend(...Object.values(data))).to.be.revertedWithCustomError(
      hub,
      'InvalidAssetParameters'
    )
  })
})
