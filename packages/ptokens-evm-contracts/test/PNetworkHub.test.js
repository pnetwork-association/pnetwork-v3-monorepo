const { expect } = require('chai')
const { ethers } = require('hardhat')
const { time } = require('@nomicfoundation/hardhat-network-helpers')
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs')
const { MerkleTree } = require('merkletreejs')
const constants = require('ptokens-constants')

const {
  BASE_CHALLENGE_PERIOD_DURATION,
  CHALLENGE_DURATION,
  CHALLENGE_STATUS,
  K_CHALLENGE_PERIOD,
  LOCKED_AMOUNT_CHALLENGE_PERIOD,
  LOCKED_AMOUNT_START_CHALLENGE,
  MAX_OPERATIONS_IN_QUEUE,
  PNETWORK_NETWORK_IDS,
  SLASHING_QUANTITY,
  TELEPATHY_ROUTER_ADDRESS,
  ZERO_ADDRESS,
  REGISTRATION_KINDS,
} = require('./constants')
const { deployPToken, getOptionMaskWithOptionEnabledForBit } = require('./utils')
const Operation = require('./utils/Operation')
const Challenge = require('./utils/Challenge')

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
  relayer2,
  testReceiver,
  testNotReceiver,
  user1,
  epochsManager,
  telepathyRouter,
  fakeGovernanceMessageVerifier,
  epochDuration,
  currentEpoch,
  governanceMessageEmitter,
  sentinels,
  guardians,
  challenger,
  chainId,
  slasher,
  feesManager,
  dao,
  pRegistry,
  lendingManager,
  interimChainId,
  mockRegistrationManager,
  abiCoder,
  broadcaster,
  fakeDandelionVoting,
  defaultActors,
  defaultActorsType,
  pDAI

describe('PNetworkHub', () => {
  const getActorsMerkleProof = ({
    actors = defaultActors,
    actor,
    types = defaultActorsType,
    type,
  }) => {
    const leaves = actors.map(({ address }, _index) =>
      ethers.utils.solidityKeccak256(['address', 'uint8'], [address, types[_index]])
    )
    const merkleTree = new MerkleTree(leaves, ethers.utils.keccak256, { sortPairs: true })
    return merkleTree.getHexProof(
      ethers.utils.solidityKeccak256(['address', 'uint8'], [actor.address, type])
    )
  }

  const propagateActors = async ({ guardians, sentinels }) => {
    const tx = await governanceMessageEmitter.propagateActors(
      await epochsManager.currentEpoch(),
      guardians.map(({ address }) => address),
      sentinels.map(({ address }) => address)
    )
    const receipt = await tx.wait(1)
    const messages = receipt.events
      .filter(({ event }) => event === 'GovernanceMessage')
      .map(({ data }) => abiCoder.decode(['bytes'], data)[0])
    await Promise.all(
      messages.map(_message =>
        hub
          .connect(telepathyRouter)
          .handleTelepathy(chainId, fakeGovernanceMessageVerifier.address, _message)
      )
    )
  }

  const getTotalNumberOfInactiveActorsByEpoch = async _epoch =>
    (await hub.getTotalNumberOfInactiveActorsByEpochAndType(
      _epoch,
      constants.hub.actors.Sentinel
    )) +
    (await hub.getTotalNumberOfInactiveActorsByEpochAndType(_epoch, constants.hub.actors.Guardian))

  const maxChallengePeriod =
    BASE_CHALLENGE_PERIOD_DURATION +
    MAX_OPERATIONS_IN_QUEUE * MAX_OPERATIONS_IN_QUEUE * K_CHALLENGE_PERIOD -
    K_CHALLENGE_PERIOD

  const generateOperation = async (_opts = {}, _hub = hub) => {
    const {
      originAccount = owner.address,
      destinationAccount = owner.address,
      destinationNetworkId = PNETWORK_NETWORK_IDS.hardhat,
      underlyingAssetName = await token.name(),
      underlyingAssetSymbol = await token.symbol(),
      underlyingAssetDecimals = await token.decimals(),
      underlyingAssetTokenAddress = token.address,
      underlyingAssetNetworkId = PNETWORK_NETWORK_IDS.hardhat,
      assetTokenAddress = token.address,
      assetAmount = ethers.utils.parseEther('1000'),
      userDataProtocolFeeAssetAmount = '0',
      networkFeeAssetAmount = '0',
      userData = '0x',
      optionsMask = '0x'.padEnd(66, '0'),
      forwardDestinationNetworkId = PNETWORK_NETWORK_IDS.hardhat,
      forwardNetworkFeeAssetAmount = '0',
    } = _opts

    if (_hub.address === hub.address) {
      await token.approve(pToken.address, assetAmount)
    } else if (_hub.address === hubInterim.address) {
      await token.approve(pTokenInterim.address, assetAmount)
    }

    // fee
    if (_hub.address === hub.address) {
      await pDAI.approve(pToken.address, ethers.utils.parseEther('10000000'))
    } else if (_hub.address === hubInterim.address) {
      await pDAI.approve(pTokenInterim.address, ethers.utils.parseEther('10000000'))
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
      networkFeeAssetAmount,
      forwardNetworkFeeAssetAmount,
      userData,
      optionsMask
    )
    await expect(transaction).to.emit(_hub, 'UserOperation')

    const nonce = 1
    const { blockHash, transactionHash } = await (await transaction).wait()

    return new Operation({
      assetAmount,
      destinationAccount,
      destinationNetworkId,
      forwardDestinationNetworkId,
      forwardNetworkFeeAssetAmount,
      networkFeeAssetAmount,
      nonce,
      optionsMask,
      originAccount,
      originBlockHash: blockHash,
      originNetworkId: PNETWORK_NETWORK_IDS.hardhat,
      originTransactionHash: transactionHash,
      userDataProtocolFeeAssetAmount,
      underlyingAssetDecimals,
      underlyingAssetName,
      underlyingAssetNetworkId,
      underlyingAssetSymbol,
      underlyingAssetTokenAddress: token.address,
      userData,
    })
  }

  beforeEach(async () => {
    // eslint-disable-next-line no-undef
    await network.provider.request({
      method: 'hardhat_reset',
    })

    chainId = (await ethers.provider.getNetwork()).chainId
    interimChainId = 0
    abiCoder = new ethers.utils.AbiCoder()

    const Slasher = await ethers.getContractFactory('Slasher')
    const PFactory = await ethers.getContractFactory('MockPFactory')
    const PRegistry = await ethers.getContractFactory('PRegistry')
    const PNetworkHub = await ethers.getContractFactory('PNetworkHub')
    const StandardToken = await ethers.getContractFactory('StandardToken')
    const TestReceiver = await ethers.getContractFactory('TestReceiver')
    const TestNotReceiver = await ethers.getContractFactory('TestNotReceiver')
    const EpochsManager = await ethers.getContractFactory('EpochsManager')
    const GovernanceMessageEmitter = await ethers.getContractFactory('MockGovernanceMessageEmitter')
    const FeesManager = await ethers.getContractFactory('MockFeesManager')
    const MockRegistrationManager = await ethers.getContractFactory('MockRegistrationManager')

    const signers = await ethers.getSigners()
    owner = signers[0]
    relayer = signers[1]
    relayer2 = signers[2]
    user1 = signers[3]
    sentinel = signers[4]
    guardian = signers[5]
    fakeGovernanceMessageVerifier = signers[6]
    sentinels = [sentinel, signers[7], signers[8], signers[9], signers[10]]
    guardians = [guardian, signers[11], signers[12]]
    challenger = signers[13]
    lendingManager = signers[14]
    dao = signers[15]
    broadcaster = signers[16]
    fakeDandelionVoting = signers[17]

    // H A R D H A T
    testReceiver = await TestReceiver.deploy()
    pFactory = await PFactory.deploy(owner.address)
    testNotReceiver = await TestNotReceiver.deploy()
    pRegistry = await PRegistry.deploy(dao.address)
    mockRegistrationManager = await MockRegistrationManager.deploy(lendingManager.address)
    slasher = await Slasher.deploy(
      pRegistry.address,
      mockRegistrationManager.address,
      SLASHING_QUANTITY
    )
    epochsManager = await EpochsManager.deploy()
    feesManager = await FeesManager.deploy()

    hubInterim = await PNetworkHub.deploy(
      // hub used to test the interim chain behavior
      pFactory.address,
      BASE_CHALLENGE_PERIOD_DURATION,
      epochsManager.address,
      feesManager.address,
      TELEPATHY_ROUTER_ADDRESS,
      fakeGovernanceMessageVerifier.address,
      slasher.address,
      fakeDandelionVoting.address,
      LOCKED_AMOUNT_CHALLENGE_PERIOD,
      K_CHALLENGE_PERIOD,
      MAX_OPERATIONS_IN_QUEUE,
      PNETWORK_NETWORK_IDS.hardhat,
      LOCKED_AMOUNT_START_CHALLENGE,
      CHALLENGE_DURATION,
      chainId
    )
    hub = await PNetworkHub.deploy(
      // hub to test the non interim chain behavior
      pFactory.address,
      BASE_CHALLENGE_PERIOD_DURATION,
      epochsManager.address,
      feesManager.address,
      TELEPATHY_ROUTER_ADDRESS,
      fakeGovernanceMessageVerifier.address,
      slasher.address,
      fakeDandelionVoting.address,
      LOCKED_AMOUNT_CHALLENGE_PERIOD,
      K_CHALLENGE_PERIOD,
      MAX_OPERATIONS_IN_QUEUE,
      PNETWORK_NETWORK_IDS.ethereumMainnet,
      LOCKED_AMOUNT_START_CHALLENGE,
      CHALLENGE_DURATION,
      chainId
    )

    await pRegistry.connect(dao).protocolAddNetwork(chainId, hub.address)
    await pRegistry.connect(dao).protocolAddNetwork(interimChainId, hubInterim.address)

    token = await StandardToken.deploy('Token', 'TKN', 18, ethers.utils.parseEther('100000000'))
    telepathyRouter = await ethers.getImpersonatedSigner(TELEPATHY_ROUTER_ADDRESS)
    governanceMessageEmitter = await GovernanceMessageEmitter.deploy(epochsManager.address)
    epochDuration = (await epochsManager.epochDuration()).toNumber()
    currentEpoch = await epochsManager.currentEpoch()

    await mockRegistrationManager.setGovernanceMessageEmitter(governanceMessageEmitter.address)

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

    pDAI = await deployPToken(
      hub.UNDERLYING_ASSET_NAME_USER_DATA_PROTOCOL_FEE(),
      hub.UNDERLYING_ASSET_SYMBOL_USER_DATA_PROTOCOL_FEE(),
      hub.UNDERLYING_ASSET_DECIMALS_USER_DATA_PROTOCOL_FEE(),
      hub.UNDERLYING_ASSET_TOKEN_ADDRESS_USER_DATA_PROTOCOL_FEE(),
      hub.UNDERLYING_ASSET_NETWORK_ID_USER_DATA_PROTOCOL_FEE(),
      {
        pFactory,
      }
    )
    await pDAI.mockMint(owner.address, ethers.utils.parseEther('10000000'))

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

    defaultActors = [...guardians, ...sentinels]
    defaultActorsType = [
      ...guardians.map(() => constants.hub.actors.Guardian),
      ...sentinels.map(() => constants.hub.actors.Sentinel),
    ]
    const tx = await governanceMessageEmitter.propagateActors(
      currentEpoch,
      guardians.map(({ address }) => address),
      sentinels.map(({ address }) => address)
    )

    const receipt = await tx.wait(1)
    const messages = receipt.events
      .filter(({ event }) => event === 'GovernanceMessage')
      .map(({ data }) => abiCoder.decode(['bytes'], data)[0]) // NOTE: abi.decode is made within GovernanceMessageVerifier

    await Promise.all(
      messages.map(_message =>
        hub
          .connect(telepathyRouter)
          .handleTelepathy(chainId, fakeGovernanceMessageVerifier.address, _message)
      )
    )

    await Promise.all(
      messages.map(_message =>
        hubInterim
          .connect(telepathyRouter)
          .handleTelepathy(chainId, fakeGovernanceMessageVerifier.address, _message)
      )
    )
  })

  it('should be able to queue an operation', async () => {
    const operation = await generateOperation()

    const relayerEthBalancePre = await ethers.provider.getBalance(relayer.address)
    const tx = hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await expect(tx).to.emit(hub, 'OperationQueued').withArgs(operation.serialize())

    const receipt = await (await tx).wait(1)
    const relayerEthBalancePost = await ethers.provider.getBalance(relayer.address)
    expect(relayerEthBalancePost).to.be.eq(
      relayerEthBalancePre
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
    )
      .to.be.revertedWithCustomError(hub, 'InvalidOperationStatus')
      .withArgs(
        constants.hub.operationStatus.AlreadyQueued,
        constants.hub.operationStatus.NotQueued
      )
  })

  it('should not be able to cancel an operation twice with the same actor', async () => {
    const operation = await generateOperation()
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await time.increase((await hub.getCurrentChallengePeriodDuration()).div(2))
    await hub
      .connect(broadcaster)
      .protocolCancelOperation(
        operation,
        constants.hub.actors.Guardian,
        getActorsMerkleProof({ actor: guardian, type: constants.hub.actors.Guardian }),
        await guardian.signMessage(ethers.utils.arrayify(operation.id))
      )
    await expect(
      hub
        .connect(broadcaster)
        .protocolCancelOperation(
          operation,
          constants.hub.actors.Guardian,
          getActorsMerkleProof({ actor: guardian, type: constants.hub.actors.Guardian }),
          await guardian.signMessage(ethers.utils.arrayify(operation.id))
        )
    )
      .to.be.revertedWithCustomError(hub, 'ActorAlreadyCancelledOperation')
      .withArgs(operation.serialize(), guardian.address, constants.hub.actors.Guardian)
  })

  it('actors should be able to cancel an operation within the challenge period', async () => {
    const operation = await generateOperation()
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await time.increase((await hub.getCurrentChallengePeriodDuration()).div(2))
    await hub
      .connect(broadcaster)
      .protocolCancelOperation(
        operation,
        constants.hub.actors.Sentinel,
        getActorsMerkleProof({ actor: sentinel, type: constants.hub.actors.Sentinel }),
        await sentinel.signMessage(ethers.utils.arrayify(operation.id))
      )
    await expect(
      hub
        .connect(broadcaster)
        .protocolCancelOperation(
          operation,
          constants.hub.actors.Guardian,
          getActorsMerkleProof({ actor: guardian, type: constants.hub.actors.Guardian }),
          await guardian.signMessage(ethers.utils.arrayify(operation.id))
        )
    )
      .to.emit(hub, 'OperationCancelFinalized')
      .withArgs(operation.serialize())
  })

  it('should not be able to cancel an operation twice with 2 guardians', async () => {
    const operation = await generateOperation()
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })

    await expect(
      hub
        .connect(broadcaster)
        .protocolCancelOperation(
          operation,
          constants.hub.actors.Guardian,
          getActorsMerkleProof({ actor: guardian, type: constants.hub.actors.Guardian }),
          await guardian.signMessage(ethers.utils.arrayify(operation.id))
        )
    )
      .to.emit(hub, 'OperationCancelled')
      .withArgs(operation.serialize(), guardian.address, constants.hub.actors.Guardian)

    const secondGuardian = guardians[1]
    await expect(
      hub
        .connect(broadcaster)
        .protocolCancelOperation(
          operation,
          constants.hub.actors.Guardian,
          getActorsMerkleProof({ actor: secondGuardian, type: constants.hub.actors.Guardian }),
          await secondGuardian.signMessage(ethers.utils.arrayify(operation.id))
        )
    )
      .to.be.revertedWithCustomError(hub, 'ActorAlreadyCancelledOperation')
      .withArgs(operation.serialize(), guardian.address, constants.hub.actors.Guardian)
  })

  it('should not be able to cancel an operation twice with 2 sentinels', async () => {
    const operation = await generateOperation()
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })

    await expect(
      hub
        .connect(broadcaster)
        .protocolCancelOperation(
          operation,
          constants.hub.actors.Sentinel,
          getActorsMerkleProof({ actor: sentinel, type: constants.hub.actors.Sentinel }),
          await sentinel.signMessage(ethers.utils.arrayify(operation.id))
        )
    )
      .to.emit(hub, 'OperationCancelled')
      .withArgs(operation.serialize(), sentinel.address, constants.hub.actors.Sentinel)

    const secondSentinel = sentinels[1]
    await expect(
      hub
        .connect(broadcaster)
        .protocolCancelOperation(
          operation,
          constants.hub.actors.Sentinel,
          getActorsMerkleProof({ actor: secondSentinel, type: constants.hub.actors.Sentinel }),
          await secondSentinel.signMessage(ethers.utils.arrayify(operation.id))
        )
    )
      .to.be.revertedWithCustomError(hub, 'ActorAlreadyCancelledOperation')
      .withArgs(operation.serialize(), sentinel.address, constants.hub.actors.Sentinel)
  })

  it('a guardian should be able to cancel immediately an operation after the challenge period', async () => {
    const operation = await generateOperation()
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await time.increase(await hub.getCurrentChallengePeriodDuration())
    await expect(
      hub
        .connect(broadcaster)
        .protocolCancelOperation(
          operation,
          constants.hub.actors.Guardian,
          getActorsMerkleProof({ actor: guardian, type: constants.hub.actors.Guardian }),
          await guardian.signMessage(ethers.utils.arrayify(operation.id))
        )
    )
      .to.emit(hub, 'OperationCancelFinalized')
      .withArgs(operation.serialize())
  })

  it('a sentinel should be able to cancel immediately an operation after the challenge period', async () => {
    const operation = await generateOperation()
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await time.increase(await hub.getCurrentChallengePeriodDuration())
    await expect(
      await hub
        .connect(broadcaster)
        .protocolCancelOperation(
          operation,
          constants.hub.actors.Sentinel,
          getActorsMerkleProof({ actor: sentinel, type: constants.hub.actors.Sentinel }),
          await sentinel.signMessage(ethers.utils.arrayify(operation.id))
        )
    )
      .to.emit(hub, 'OperationCancelFinalized')
      .withArgs(operation.serialize())
  })

  it('a guardian should not be able to cancel an operation that has not been queued', async () => {
    const fakeOperation = new Operation()
    await expect(
      hub
        .connect(broadcaster)
        .protocolCancelOperation(
          fakeOperation,
          constants.hub.actors.Guardian,
          getActorsMerkleProof({ actor: guardian, type: constants.hub.actors.Guardian }),
          await guardian.signMessage(ethers.utils.arrayify(fakeOperation.id))
        )
    )
      .to.be.revertedWithCustomError(hub, 'InvalidOperationStatus')
      .withArgs(
        constants.hub.operationStatus.NotQueued,
        constants.hub.operationStatus.AlreadyQueued
      )
  })

  it('should not be able to execute an operation that has not been queued', async () => {
    const fakeOperation = new Operation()
    await expect(hub.connect(relayer).protocolExecuteOperation(fakeOperation))
      .to.be.revertedWithCustomError(hub, 'InvalidOperationStatus')
      .withArgs(
        constants.hub.operationStatus.NotQueued,
        constants.hub.operationStatus.AlreadyQueued
      )
  })

  it('should not be able to execute an operation that has been cancelled', async () => {
    const operation = await generateOperation()
    await hubInterim
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await hubInterim
      .connect(broadcaster)
      .protocolCancelOperation(
        operation,
        constants.hub.actors.Guardian,
        getActorsMerkleProof({ actor: guardian, type: constants.hub.actors.Guardian }),
        await guardian.signMessage(ethers.utils.arrayify(operation.id))
      )
    await hubInterim.connect(fakeDandelionVoting).protocolGovernanceCancelOperation(operation)
    await expect(hubInterim.connect(relayer).protocolExecuteOperation(operation))
      .to.be.revertedWithCustomError(hubInterim, 'InvalidOperationStatus')
      .withArgs(
        constants.hub.operationStatus.AlreadyCancelled,
        constants.hub.operationStatus.AlreadyQueued
      )
  })

  it('should not be able to cancel an operation on the interim chain if it msg.sender is not dandelion voting', async () => {
    const operation = await generateOperation()
    await hubInterim
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await expect(
      hubInterim.connect(sentinel).protocolGovernanceCancelOperation(operation)
    ).to.be.revertedWithCustomError(hubInterim, 'NotDandelionVoting')
  })

  it('should not be able to cancel an operation calling protocolGovernanceCancelOperation when network != interim chain', async () => {
    const operation = await generateOperation()
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await expect(
      hub.connect(fakeDandelionVoting).protocolGovernanceCancelOperation(operation)
    ).to.be.revertedWithCustomError(hub, 'InvalidNetwork')
  })

  it('should be able to cancel an operation using a crosschain message', async () => {
    const operation = await generateOperation()
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })

    await hub
      .connect(broadcaster)
      .protocolCancelOperation(
        operation,
        constants.hub.actors.Guardian,
        getActorsMerkleProof({ actor: guardian, type: constants.hub.actors.Guardian }),
        await guardian.signMessage(ethers.utils.arrayify(operation.id))
      )

    const tx = await governanceMessageEmitter.protocolGovernanceCancelOperation(operation)
    const receipt = await tx.wait(1)
    const message = receipt.events.find(({ event }) => event === 'GovernanceMessage')

    await expect(
      hub
        .connect(telepathyRouter)
        .handleTelepathy(
          chainId,
          fakeGovernanceMessageVerifier.address,
          abiCoder.decode(['bytes'], message.data)[0]
        )
    )
      .to.emit(hub, 'OperationCancelFinalized')
      .withArgs(operation.serialize())
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

  it('should be able to execute an operation on the destination chain when network fee is 0', async () => {
    const operation = await generateOperation({
      forwardDestinationNetworkId: PNETWORK_NETWORK_IDS.hardhat,
    })
    const relayerEthBalancePre = await ethers.provider.getBalance(relayer.address)
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

    const relayerEthBalancePost = await ethers.provider.getBalance(relayer.address)
    const destinationAccountbalancePost = await pToken.balanceOf(operation.destinationAccount)

    expect(destinationAccountbalancePost).to.be.eq(
      destinationAccountbalancePre.add(operation.assetAmount)
    )

    expect(relayerEthBalancePost).to.be.eq(
      relayerEthBalancePre
        .sub(receipt1.gasUsed.mul(receipt1.effectiveGasPrice))
        .sub(receipt2.gasUsed.mul(receipt2.effectiveGasPrice))
    )
  })

  it('should be able to execute an operation on the interim chain and subtracting a protocolFee from the operation.assetAmount and forward another UserOperation. Network fee is 0', async () => {
    await pFactory.setHub(hubInterim.address)
    const operation = await generateOperation(
      {
        forwardDestinationNetworkId: PNETWORK_NETWORK_IDS.ethereumMainnet,
        destinationNetworkId: PNETWORK_NETWORK_IDS.hardhat,
      },
      hubInterim
    )
    const relayerEthBalancePre = await ethers.provider.getBalance(relayer.address)
    const destinationAccountbalancePre = await pTokenInterim.balanceOf(operation.destinationAccount)

    let tx = await hubInterim
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    const receipt1 = await tx.wait(1)

    await time.increase(await hubInterim.getCurrentChallengePeriodDuration())

    const protocolFee = operation.getProtocolFee()
    // const pTokenAddress = await pFactory.getPTokenAddress(
    //   operation.underlyingAssetName,
    //   operation.underlyingAssetSymbol,
    //   operation.underlyingAssetDecimals,
    //   operation.underlyingAssetTokenAddress,
    //   operation.underlyingAssetNetworkId
    // )

    tx = hubInterim.connect(relayer).protocolExecuteOperation(operation)
    await expect(tx)
      .to.emit(hubInterim, 'UserOperation')
      // .withArgs(
      //   28876268,
      //   operation.destinationAccount,
      //   operation.forwardDestinationNetworkId,
      //   operation.underlyingAssetName,
      //   operation.underlyingAssetSymbol,
      //   operation.underlyingAssetDecimals,
      //   operation.underlyingAssetTokenAddress,
      //   operation.underlyingAssetNetworkId,
      //   pTokenAddress,
      //   operation.assetAmountWithoutProtocolFee,
      //   ZERO_ADDRESS,
      //   '0',
      //   '0',
      //   '0',
      //   '0x00000000',
      //   operation.userData,
      //   operation.optionsMask
      // )
      .and.to.emit(pTokenInterim, 'Transfer')
      .withArgs(ZERO_ADDRESS, hubInterim.address, protocolFee)
      .and.to.emit(hubInterim, 'OperationExecuted')
      .withArgs(operation.serialize())
    const receipt2 = await (await tx).wait(1)

    const relayerEthBalancePost = await ethers.provider.getBalance(relayer.address)
    const destinationAccountbalancePost = await pTokenInterim.balanceOf(
      operation.destinationAccount
    )

    expect(destinationAccountbalancePost).to.be.eq(destinationAccountbalancePre)

    expect(relayerEthBalancePost).to.be.eq(
      relayerEthBalancePre
        .sub(receipt1.gasUsed.mul(receipt1.effectiveGasPrice))
        .sub(receipt2.gasUsed.mul(receipt2.effectiveGasPrice))
    )
  })

  it('should be able to execute an operation on the interim chain and subtracting a protocolFee from the operation.assetAmount when destinationNetworkId is the interim chain', async () => {
    await pFactory.setHub(hubInterim.address)
    const operation = await generateOperation(
      {
        destinationNetworkId: PNETWORK_NETWORK_IDS.hardhat,
        forwardDestinationNetworkId: PNETWORK_NETWORK_IDS.hardhat,
      },
      hubInterim
    )
    const relayerEthBalancePre = await ethers.provider.getBalance(relayer.address)
    const destinationAccountbalancePre = await pTokenInterim.balanceOf(operation.destinationAccount)

    let tx = await hubInterim
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    const receipt1 = await tx.wait(1)

    await time.increase(await hubInterim.getCurrentChallengePeriodDuration())

    const protocolFee = operation.getProtocolFee()

    tx = hubInterim.connect(relayer).protocolExecuteOperation(operation)
    await expect(tx).to.not.emit(hubInterim, 'UserOperation')
    await expect(tx)
      .to.emit(pTokenInterim, 'Transfer')
      .withArgs(ZERO_ADDRESS, hubInterim.address, protocolFee)
      .and.to.emit(pTokenInterim, 'Transfer')
      .withArgs(ZERO_ADDRESS, operation.destinationAccount, operation.assetAmountWithoutProtocolFee)
      .and.to.emit(hubInterim, 'OperationExecuted')
      .withArgs(operation.serialize())
    const receipt2 = await (await tx).wait(1)

    const relayerEthBalancePost = await ethers.provider.getBalance(relayer.address)
    const destinationAccountbalancePost = await pTokenInterim.balanceOf(
      operation.destinationAccount
    )

    expect(destinationAccountbalancePost).to.be.eq(
      destinationAccountbalancePre.add(operation.assetAmountWithoutProtocolFee)
    )

    expect(relayerEthBalancePost).to.be.eq(
      relayerEthBalancePre
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
    await expect(hub.connect(relayer).protocolExecuteOperation(operation))
      .to.be.revertedWithCustomError(hub, 'InvalidOperationStatus')
      .withArgs(
        constants.hub.operationStatus.AlreadyExecuted,
        constants.hub.operationStatus.AlreadyQueued
      )
  })

  it('should be able to execute an operation that contains user data', async () => {
    const expectedUserData = '0x01'
    const operation = await generateOperation({
      originAccount: relayer.address,
      userData: expectedUserData,
      destinationAccount: testReceiver.address,
      destinationNetworkId: PNETWORK_NETWORK_IDS.ethereumMainnet,
    })
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await time.increase(await hub.getCurrentChallengePeriodDuration())
    await expect(hub.connect(relayer).protocolExecuteOperation(operation))
      .to.emit(hub, 'OperationExecuted')
      .withArgs(operation.serialize())
      .and.to.emit(testReceiver, 'UserDataReceived')
      .withArgs(PNETWORK_NETWORK_IDS.hardhat, relayer.address, expectedUserData)
  })

  // TODO: tests for testing user data fees

  it('should be able to execute an operation that contains user data despite the receiver is a contract that does extends from PReceiver', async () => {
    const operation = await generateOperation({
      userData: '0x01',
      destinationAccount: testNotReceiver.address,
      destinationNetworkId: PNETWORK_NETWORK_IDS.ethereumMainnet,
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
      destinationNetworkId: PNETWORK_NETWORK_IDS.ethereumMainnet,
    })
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await time.increase(await hub.getCurrentChallengePeriodDuration())
    await expect(
      hub.connect(relayer).protocolExecuteOperation(operation)
    ).to.be.revertedWithCustomError(hub, 'NotContract')
  })

  it('should not be able to queue an operation because the defaultActors merkle root for the current epoch has not been received yet', async () => {
    await time.increase(epochDuration)
    expect(await hub.isLockedDown()).to.be.true
    const operation = await generateOperation()
    await expect(
      hub
        .connect(relayer)
        .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    ).to.be.revertedWithCustomError(hub, 'LockDown')
  })

  it('should not be able to queue an operation because is missing less than 1 hour plus max challenge period', async () => {
    const currentEpoch = await epochsManager.currentEpoch()
    const startFirstEpochTimestamp = (await epochsManager.startFirstEpochTimestamp()).toNumber()
    const currentEpochEndTimestamp = startFirstEpochTimestamp + (currentEpoch + 1) * epochDuration
    expect(await hub.isLockedDown()).to.be.false
    await time.increaseTo(currentEpochEndTimestamp - (3600 + maxChallengePeriod))
    expect(await hub.isLockedDown()).to.be.true
    const operation = await generateOperation()
    await expect(
      hub
        .connect(relayer)
        .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    ).to.be.revertedWithCustomError(hub, 'LockDown')
  })

  it('should not be able to execute an operation because is missing less than 1 hour before the ending of the current epoch', async () => {
    const operation = await generateOperation()
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })

    const currentEpoch = await epochsManager.currentEpoch()
    const startFirstEpochTimestamp = (await epochsManager.startFirstEpochTimestamp()).toNumber()
    const currentEpochEndTimestamp = startFirstEpochTimestamp + (currentEpoch + 1) * epochDuration
    expect(await hub.isLockedDown()).to.be.false
    await time.increaseTo(currentEpochEndTimestamp - 1800)
    expect(await hub.isLockedDown()).to.be.true
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
      await hubInterim
        .connect(relayer)
        .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })

      const [startTimestamp, endTimestamp] = await hubInterim.challengePeriodOf(operation)

      const currentActiveActorsAdjustment = 0 // TODO await hubInterim.getCurrentActiveActorsAdjustmentDuration()
      const expectedCurrentChallengePeriodDuration =
        BASE_CHALLENGE_PERIOD_DURATION +
        currentActiveActorsAdjustment +
        numberOfOperations * numberOfOperations * K_CHALLENGE_PERIOD -
        K_CHALLENGE_PERIOD
      expect(expectedCurrentChallengePeriodDuration).to.be.eq(endTimestamp.sub(startTimestamp))
      operations.push(operation)
    }

    await expect(
      hubInterim.connect(relayer).protocolQueueOperation(await generateOperation(), {
        value: LOCKED_AMOUNT_CHALLENGE_PERIOD,
      })
    ).to.be.revertedWithCustomError(hubInterim, 'QueueFull')
    expect(await hubInterim.numberOfOperationsInQueue()).to.be.eq(MAX_OPERATIONS_IN_QUEUE)

    for (
      let index = 0, numberOfOperations = MAX_OPERATIONS_IN_QUEUE;
      index < MAX_OPERATIONS_IN_QUEUE;
      index++, numberOfOperations--
    ) {
      const operation = operations[index]
      const [startTimestamp, endTimestamp] = await hubInterim.challengePeriodOf(operation)

      const currentActiveActorsAdjustment = 0 // TODO await hubInterim.getCurrentActiveActorsAdjustmentDuration()
      const expectedCurrentChallengePeriodDuration =
        BASE_CHALLENGE_PERIOD_DURATION +
        currentActiveActorsAdjustment +
        numberOfOperations * numberOfOperations * K_CHALLENGE_PERIOD -
        K_CHALLENGE_PERIOD
      expect(expectedCurrentChallengePeriodDuration).to.be.eq(endTimestamp.sub(startTimestamp))

      await hubInterim
        .connect(broadcaster)
        .protocolCancelOperation(
          operation,
          constants.hub.actors.Guardian,
          getActorsMerkleProof({ actor: guardian, type: constants.hub.actors.Guardian }),
          await guardian.signMessage(ethers.utils.arrayify(operation.id))
        )
      await hubInterim.connect(fakeDandelionVoting).protocolGovernanceCancelOperation(operation)
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

      const currentActiveActorsAdjustment = 0 // TODO await hub.getCurrentActiveActorsAdjustmentDuration()
      const expectedCurrentChallengePeriodDuration =
        BASE_CHALLENGE_PERIOD_DURATION +
        currentActiveActorsAdjustment +
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
      networkFeeAssetAmount: '0',
      forwardNetworkFeeAssetAmount: '0',
      userData: '0x',
      optionsMask: '0x'.padEnd(66, '0'),
    }

    await token.approve(pToken.address, assetAmount)
    await expect(hub.userSend(...Object.values(data))).to.emit(hub, 'UserOperation')
  })

  it('should be able to call userSend to send userData', async () => {
    // TODO: calculate it correctly
    const fakeUserDataProtocolFeeAssetAmount = ethers.utils.parseEther('1000')
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
      networkFeeAssetAmount: '0',
      forwardNetworkFeeAssetAmount: '0',
      userData: '0x00',
      optionsMask: '0x'.padEnd(66, '0'),
    }

    await token.approve(pToken.address, fakeUserDataProtocolFeeAssetAmount)
    await expect(hub.userSend(...Object.values(data))).to.emit(hub, 'UserOperation')
  })

  it('should be able to execute an operation on the destination chain (!= interim) when network fee is greather than 0. Queue and execute are sent by the same relayer', async () => {
    const networkFeeAssetAmount = ethers.utils.parseEther('1')

    const operation = await generateOperation({ networkFeeAssetAmount })
    const relayerEthBalancePre = await ethers.provider.getBalance(relayer.address)
    const relayerBalancePre = await pToken.balanceOf(relayer.address)
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
      .withArgs(ZERO_ADDRESS, operation.destinationAccount, operation.assetAmountWithoutNetworkFee)
      .and.to.emit(pToken, 'Transfer')
      .withArgs(ZERO_ADDRESS, relayer.address, operation.networkFeeAssetAmount)
    const receipt2 = await (await tx).wait(1)

    const relayerEthBalancePost = await ethers.provider.getBalance(relayer.address)
    const relayerBalancePost = await pToken.balanceOf(relayer.address)
    const destinationAccountbalancePost = await pToken.balanceOf(operation.destinationAccount)

    expect(destinationAccountbalancePost).to.be.eq(
      destinationAccountbalancePre.add(operation.assetAmountWithoutNetworkFee)
    )
    expect(relayerBalancePost).to.be.eq(relayerBalancePre.add(operation.networkFeeAssetAmount))
    expect(relayerEthBalancePost).to.be.eq(
      relayerEthBalancePre
        .sub(receipt1.gasUsed.mul(receipt1.effectiveGasPrice))
        .sub(receipt2.gasUsed.mul(receipt2.effectiveGasPrice))
    )
  })

  it('should be able to execute an operation on the destination chain (== interim) when network fee is greather than 0. Queue and execute are sent by the same relayer', async () => {
    await pFactory.setHub(hubInterim.address)

    const operation = await generateOperation(
      {
        forwardDestinationNetworkId: '0x00000000',
        destinationNetworkId: PNETWORK_NETWORK_IDS.hardhat,
        networkFeeAssetAmount: ethers.utils.parseEther('1'),
        forwardNetworkFeeAssetAmount: '0',
      },
      hubInterim
    )
    const relayerEthBalancePre = await ethers.provider.getBalance(relayer.address)
    const relayerBalancePre = await pTokenInterim.balanceOf(relayer.address)
    const destinationAccountbalancePre = await pTokenInterim.balanceOf(operation.destinationAccount)

    let tx = await hubInterim
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    const receipt1 = await tx.wait(1)

    await time.increase(await hubInterim.getCurrentChallengePeriodDuration())

    tx = hubInterim.connect(relayer).protocolExecuteOperation(operation)
    await expect(tx)
      .to.emit(hubInterim, 'OperationExecuted')
      .withArgs(operation.serialize())
      .and.to.emit(pTokenInterim, 'Transfer')
      .withArgs(
        ZERO_ADDRESS,
        operation.destinationAccount,
        operation.assetAmountWithoutProtocolFeeAndNetworkFee
      )
      .and.to.emit(pTokenInterim, 'Transfer')
      .withArgs(ZERO_ADDRESS, relayer.address, operation.networkFeeAssetAmount)
    const receipt2 = await (await tx).wait(1)

    const relayerEthBalancePost = await ethers.provider.getBalance(relayer.address)
    const relayerBalancePost = await pTokenInterim.balanceOf(relayer.address)
    const destinationAccountbalancePost = await pTokenInterim.balanceOf(
      operation.destinationAccount
    )

    expect(destinationAccountbalancePost).to.be.eq(
      destinationAccountbalancePre.add(operation.assetAmountWithoutProtocolFeeAndNetworkFee)
    )
    expect(relayerBalancePost).to.be.eq(relayerBalancePre.add(operation.networkFeeAssetAmount))
    expect(relayerEthBalancePost).to.be.eq(
      relayerEthBalancePre
        .sub(receipt1.gasUsed.mul(receipt1.effectiveGasPrice))
        .sub(receipt2.gasUsed.mul(receipt2.effectiveGasPrice))
    )
  })

  it('should be able to execute an operation on the destination chain (== interim) when network fee is greather than 0. Queue and execute are sent by different relayers', async () => {
    await pFactory.setHub(hubInterim.address)

    const operation = await generateOperation(
      {
        forwardDestinationNetworkId: '0x00000000',
        destinationNetworkId: PNETWORK_NETWORK_IDS.hardhat,
        networkFeeAssetAmount: ethers.utils.parseEther('1'),
        forwardNetworkFeeAssetAmount: '0',
      },
      hubInterim
    )
    const relayerEthBalancePre = await ethers.provider.getBalance(relayer.address)
    const relayerBalancePre = await pTokenInterim.balanceOf(relayer.address)
    const relayer2BalancePre = await pTokenInterim.balanceOf(relayer2.address)
    const destinationAccountbalancePre = await pTokenInterim.balanceOf(operation.destinationAccount)

    const tx = await hubInterim
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    const receipt1 = await tx.wait(1)

    await time.increase(await hubInterim.getCurrentChallengePeriodDuration())

    await expect(hubInterim.connect(relayer2).protocolExecuteOperation(operation))
      .to.emit(hubInterim, 'OperationExecuted')
      .withArgs(operation.serialize())
      .and.to.emit(pTokenInterim, 'Transfer')
      .withArgs(
        ZERO_ADDRESS,
        operation.destinationAccount,
        operation.assetAmountWithoutProtocolFeeAndNetworkFee
      )
      .and.to.emit(pTokenInterim, 'Transfer')
      .withArgs(ZERO_ADDRESS, relayer.address, operation.queueRelayerNetworkFeeAssetAmount)
      .and.to.emit(pTokenInterim, 'Transfer')
      .withArgs(ZERO_ADDRESS, relayer2.address, operation.executeRelayerNetworkFeeAssetAmount)
      .and.to.not.emit(hub, 'UserOperation')

    const relayerEthBalancePost = await ethers.provider.getBalance(relayer.address)
    const relayerBalancePost = await pTokenInterim.balanceOf(relayer.address)
    const relayer2BalancePost = await pTokenInterim.balanceOf(relayer2.address)
    const destinationAccountbalancePost = await pTokenInterim.balanceOf(
      operation.destinationAccount
    )

    expect(destinationAccountbalancePost).to.be.eq(
      destinationAccountbalancePre.add(operation.assetAmountWithoutProtocolFeeAndNetworkFee)
    )
    expect(relayerBalancePost).to.be.eq(
      relayerBalancePre.add(operation.queueRelayerNetworkFeeAssetAmount)
    )
    expect(relayer2BalancePost).to.be.eq(
      relayer2BalancePre.add(operation.executeRelayerNetworkFeeAssetAmount)
    )
    expect(relayerEthBalancePost).to.be.eq(
      relayerEthBalancePre.sub(receipt1.gasUsed.mul(receipt1.effectiveGasPrice))
    )
  })

  it('should be able to execute an operation on the destination chain (!= interim) when network fee is greather than 0. Queue and execute are sent by different relayers', async () => {
    const networkFeeAssetAmount = ethers.utils.parseEther('1')

    const operation = await generateOperation({ networkFeeAssetAmount })
    const relayerEthBalancePre = await ethers.provider.getBalance(relayer.address)
    const relayerBalancePre = await pToken.balanceOf(relayer.address)
    const relayer2BalancePre = await pToken.balanceOf(relayer2.address)
    const destinationAccountbalancePre = await pToken.balanceOf(operation.destinationAccount)

    const tx = await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    const receipt1 = await tx.wait(1)

    await time.increase(await hub.getCurrentChallengePeriodDuration())

    await expect(hub.connect(relayer2).protocolExecuteOperation(operation))
      .to.emit(hub, 'OperationExecuted')
      .withArgs(operation.serialize())
      .and.to.emit(pToken, 'Transfer')
      .withArgs(ZERO_ADDRESS, operation.destinationAccount, operation.assetAmountWithoutNetworkFee)
      .and.to.emit(pToken, 'Transfer')
      .withArgs(ZERO_ADDRESS, relayer.address, operation.queueRelayerNetworkFeeAssetAmount)
      .and.to.emit(pToken, 'Transfer')
      .withArgs(ZERO_ADDRESS, relayer2.address, operation.executeRelayerNetworkFeeAssetAmount)
      .and.to.not.emit(hub, 'UserOperation')

    const relayerEthBalancePost = await ethers.provider.getBalance(relayer.address)
    const relayerBalancePost = await pToken.balanceOf(relayer.address)
    const relayer2BalancePost = await pToken.balanceOf(relayer2.address)
    const destinationAccountbalancePost = await pToken.balanceOf(operation.destinationAccount)

    expect(destinationAccountbalancePost).to.be.eq(
      destinationAccountbalancePre.add(operation.assetAmountWithoutNetworkFee)
    )
    expect(relayerBalancePost).to.be.eq(
      relayerBalancePre.add(operation.queueRelayerNetworkFeeAssetAmount)
    )
    expect(relayer2BalancePost).to.be.eq(
      relayer2BalancePre.add(operation.executeRelayerNetworkFeeAssetAmount)
    )
    expect(relayerEthBalancePost).to.be.eq(
      relayerEthBalancePre.sub(receipt1.gasUsed.mul(receipt1.effectiveGasPrice))
    )
  })

  it('should be able to execute an operation on the interim chain, subtracting the protocol fee and the network fee (sending it to the same relayer) and forward another UserOperation', async () => {
    await pFactory.setHub(hubInterim.address)

    const networkFeeAssetAmount = ethers.utils.parseEther('1')
    const forwardNetworkFeeAssetAmount = ethers.utils.parseEther('2')
    const operation = await generateOperation(
      {
        forwardDestinationNetworkId: PNETWORK_NETWORK_IDS.ethereumMainnet,
        destinationNetworkId: PNETWORK_NETWORK_IDS.hardhat,
        networkFeeAssetAmount,
        forwardNetworkFeeAssetAmount,
      },
      hubInterim
    )
    const relayerEthBalancePre = await ethers.provider.getBalance(relayer.address)
    const relayerBalancePre = await pTokenInterim.balanceOf(relayer.address)
    const destinationAccountbalancePre = await pTokenInterim.balanceOf(operation.destinationAccount)

    let tx = await hubInterim
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    const receipt1 = await tx.wait(1)

    await time.increase(await hubInterim.getCurrentChallengePeriodDuration())

    const protocolFee = operation.getProtocolFee()
    const pTokenAddress = await pFactory.getPTokenAddress(
      operation.underlyingAssetName,
      operation.underlyingAssetSymbol,
      operation.underlyingAssetDecimals,
      operation.underlyingAssetTokenAddress,
      operation.underlyingAssetNetworkId
    )

    tx = hubInterim.connect(relayer).protocolExecuteOperation(operation)

    await expect(tx)
      .to.emit(hubInterim, 'UserOperation')
      .withArgs(
        anyValue,
        operation.originAccount,
        operation.destinationAccount,
        operation.forwardDestinationNetworkId,
        operation.underlyingAssetName,
        operation.underlyingAssetSymbol,
        operation.underlyingAssetDecimals,
        operation.underlyingAssetTokenAddress,
        operation.underlyingAssetNetworkId,
        pTokenAddress,
        operation.assetAmountWithoutProtocolFeeAndNetworkFee,
        '0',
        forwardNetworkFeeAssetAmount,
        '0',
        '0x00000000',
        operation.userData,
        operation.optionsMask,
        operation.isForProtocol
      )
      .and.to.emit(pTokenInterim, 'Transfer')
      .withArgs(ZERO_ADDRESS, hubInterim.address, protocolFee)
      .and.to.emit(pTokenInterim, 'Transfer')
      .withArgs(ZERO_ADDRESS, relayer.address, operation.networkFeeAssetAmount)
      .and.to.emit(hubInterim, 'OperationExecuted')
      .withArgs(operation.serialize())
      .and.to.emit(feesManager, 'FeeDeposited')
      .withArgs(pTokenInterim.address, protocolFee)
    const receipt2 = await (await tx).wait(1)

    const relayerEthBalancePost = await ethers.provider.getBalance(relayer.address)
    const relayerBalancePost = await pTokenInterim.balanceOf(relayer.address)
    const destinationAccountbalancePost = await pTokenInterim.balanceOf(
      operation.destinationAccount
    )

    expect(destinationAccountbalancePost).to.be.eq(destinationAccountbalancePre)
    expect(relayerBalancePost).to.be.eq(relayerBalancePre.add(operation.networkFeeAssetAmount))
    expect(relayerEthBalancePost).to.be.eq(
      relayerEthBalancePre
        .sub(receipt1.gasUsed.mul(receipt1.effectiveGasPrice))
        .sub(receipt2.gasUsed.mul(receipt2.effectiveGasPrice))
    )
  })

  it('should be able to open a challenge for a sentinel', async () => {
    const challengedSentinel = sentinels[2]
    await expect(
      hub
        .connect(challenger)
        .startChallenge(
          challengedSentinel.address,
          constants.hub.actors.Sentinel,
          getActorsMerkleProof({ actor: challengedSentinel, type: constants.hub.actors.Sentinel }),
          {
            value: LOCKED_AMOUNT_START_CHALLENGE,
          }
        )
    ).to.emit(hub, 'ChallengePending')
  })

  it('should not be able to open a challenge for the same sentinel twice', async () => {
    const challengedSentinel = sentinels[2]
    const proof = getActorsMerkleProof({
      actor: challengedSentinel,
      type: constants.hub.actors.Sentinel,
    })
    await hub
      .connect(challenger)
      .startChallenge(challengedSentinel.address, constants.hub.actors.Sentinel, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    await expect(
      hub
        .connect(challenger)
        .startChallenge(challengedSentinel.address, constants.hub.actors.Sentinel, proof, {
          value: LOCKED_AMOUNT_START_CHALLENGE,
        })
    ).to.be.revertedWithCustomError(hub, 'InvalidActorStatus')
  })

  it('should not be able to open a challenge with a wrong locked amount for the same sentinel', async () => {
    const challengedSentinel = sentinels[2]
    const proof = getActorsMerkleProof({
      actor: challengedSentinel,
      type: constants.hub.actors.Sentinel,
    })
    await expect(
      hub
        .connect(challenger)
        .startChallenge(challengedSentinel.address, constants.hub.actors.Sentinel, proof, {
          value: 0,
        })
    ).to.be.revertedWithCustomError(hub, 'InvalidLockedAmountStartChallenge')
  })

  it('should be able to open a challenge for a guardian', async () => {
    const challengedGuardian = guardians[2]
    await expect(
      hub
        .connect(challenger)
        .startChallenge(
          challengedGuardian.address,
          constants.hub.actors.Guardian,
          getActorsMerkleProof({ actor: challengedGuardian, type: constants.hub.actors.Guardian }),
          {
            value: LOCKED_AMOUNT_START_CHALLENGE,
          }
        )
    ).to.emit(hub, 'ChallengePending')
  })

  it('should not be able to open a challenge for the same guardian twice', async () => {
    const challengedGuardian = guardians[2]
    const proof = getActorsMerkleProof({
      actor: challengedGuardian,
      type: constants.hub.actors.Guardian,
    })
    await hub
      .connect(challenger)
      .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    await expect(
      hub
        .connect(challenger)
        .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
          value: LOCKED_AMOUNT_START_CHALLENGE,
        })
    ).to.be.revertedWithCustomError(hub, 'InvalidActorStatus')
  })

  it('should not be able to open a challenge with a wrong locked amount for the same guardian', async () => {
    const challengedGuardian = guardians[2]
    const proof = getActorsMerkleProof({
      actor: challengedGuardian,
      type: constants.hub.actors.Guardian,
    })
    await expect(
      hub
        .connect(challenger)
        .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
          value: 0,
        })
    ).to.be.revertedWithCustomError(hub, 'InvalidLockedAmountStartChallenge')
  })

  it('should be able to solve a challenge of a sentinel', async () => {
    const challengedSentinel = sentinels[2]
    const proof = getActorsMerkleProof({
      actor: challengedSentinel,
      type: constants.hub.actors.Sentinel,
    })

    const tx = await hub
      .connect(challenger)
      .startChallenge(challengedSentinel.address, constants.hub.actors.Sentinel, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    const challenge = Challenge.fromReceipt(await tx.wait(1))

    await expect(
      hub
        .connect(broadcaster)
        .solveChallenge(
          challenge,
          constants.hub.actors.Sentinel,
          proof,
          await challengedSentinel.signMessage(ethers.utils.arrayify(challenge.id))
        )
    )
      .to.emit(hub, 'ChallengeSolved')
      .withArgs(challenge.serialize())
    expect(await hub.getChallengeStatus(challenge)).to.be.eq(CHALLENGE_STATUS.Solved)
  })

  it('should not be able to solve a challenge of a sentinel because max challenge duration is passed', async () => {
    const challengedSentinel = sentinels[2]
    const proof = getActorsMerkleProof({
      actor: challengedSentinel,
      type: constants.hub.actors.Sentinel,
    })
    const tx = await hub
      .connect(challenger)
      .startChallenge(challengedSentinel.address, constants.hub.actors.Sentinel, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    const challenge = Challenge.fromReceipt(await tx.wait(1))
    await time.increase(CHALLENGE_DURATION)

    await expect(
      hub
        .connect(broadcaster)
        .solveChallenge(
          challenge,
          constants.hub.actors.Sentinel,
          proof,
          await challengedSentinel.signMessage(ethers.utils.arrayify(challenge.id))
        )
    ).to.be.revertedWithCustomError(hub, 'ChallengeDurationPassed')
  })

  it('should not be able to solve a challenge of a sentinel by using another sentinel', async () => {
    const challengedSentinel = sentinels[2]
    const wrongSentinel = sentinels[3]
    const proof = getActorsMerkleProof({
      actor: challengedSentinel,
      type: constants.hub.actors.Sentinel,
    })
    const tx = await hub
      .connect(challenger)
      .startChallenge(challengedSentinel.address, constants.hub.actors.Sentinel, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    const challenge = Challenge.fromReceipt(await tx.wait(1))
    await expect(
      hub
        .connect(broadcaster)
        .solveChallenge(
          challenge,
          constants.hub.actors.Sentinel,
          proof,
          await wrongSentinel.signMessage(ethers.utils.arrayify(challenge.id))
        )
    )
      .to.be.revertedWithCustomError(hub, 'InvalidActor')
      .withArgs(wrongSentinel.address, constants.hub.actors.Sentinel)
  })

  it('should be able to slash a sentinel', async () => {
    const challengedSentinel = sentinels[2]
    const proof = getActorsMerkleProof({
      actor: challengedSentinel,
      type: constants.hub.actors.Sentinel,
    })
    let tx = await hub
      .connect(challenger)
      .startChallenge(challengedSentinel.address, constants.hub.actors.Sentinel, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    const challenge = Challenge.fromReceipt(await tx.wait(1))
    await time.increase(CHALLENGE_DURATION)

    const balancePre = await ethers.provider.getBalance(challenger.address)

    tx = hub.connect(challenger).slashByChallenge(challenge)
    await expect(tx)
      .to.emit(hub, 'UserOperation')
      .and.to.emit(hub, 'ChallengeUnsolved')
      .withArgs(challenge.serialize())
    const receipt = await (await tx).wait(1)

    const balancePost = await ethers.provider.getBalance(challenger.address)
    expect(balancePost).to.be.eq(
      balancePre
        .add(LOCKED_AMOUNT_START_CHALLENGE)
        .sub(receipt.gasUsed.mul(receipt.effectiveGasPrice))
    )
    expect(await hub.getChallengeStatus(challenge)).to.be.eq(CHALLENGE_STATUS.Unsolved)
  })

  it('should not be able to slash a sentinel if max challenge duration is not passed', async () => {
    const challengedSentinel = sentinels[2]
    const proof = getActorsMerkleProof({
      actor: challengedSentinel,
      type: constants.hub.actors.Sentinel,
    })
    const tx = await hub
      .connect(challenger)
      .startChallenge(challengedSentinel.address, constants.hub.actors.Sentinel, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    const challenge = Challenge.fromReceipt(await tx.wait(1))
    await expect(hub.connect(challenger).slashByChallenge(challenge)).to.be.revertedWithCustomError(
      hub,
      'MaxChallengeDurationNotPassed'
    )
  })

  it('should be able to resume a sentinel after slashing', async () => {
    const challengedSentinel = sentinels[2]
    const proof = getActorsMerkleProof({
      actor: challengedSentinel,
      type: constants.hub.actors.Sentinel,
    })
    let tx = await hub
      .connect(challenger)
      .startChallenge(challengedSentinel.address, constants.hub.actors.Sentinel, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    const challenge = Challenge.fromReceipt(await tx.wait(1))
    await time.increase(CHALLENGE_DURATION)

    const preTotalNumberOfInactiveActors = await getTotalNumberOfInactiveActorsByEpoch(currentEpoch)
    await hub.connect(challenger).slashByChallenge(challenge)

    expect(await getTotalNumberOfInactiveActorsByEpoch(currentEpoch)).to.be.eq(
      preTotalNumberOfInactiveActors + 1
    )

    tx = await governanceMessageEmitter.resumeActor(
      challengedSentinel.address,
      REGISTRATION_KINDS.StakingSentinel
    )
    const receipt = await tx.wait(1)
    const message = receipt.events.find(({ event }) => event === 'GovernanceMessage')

    await expect(
      hub
        .connect(telepathyRouter)
        .handleTelepathy(
          chainId,
          fakeGovernanceMessageVerifier.address,
          abiCoder.decode(['bytes'], message.data)[0]
        )
    )
      .to.emit(hub, 'ActorResumed')
      .withArgs(currentEpoch, challengedSentinel.address)

    expect(await getTotalNumberOfInactiveActorsByEpoch(currentEpoch)).to.be.eq(
      preTotalNumberOfInactiveActors
    )
  })

  it('should not be able to slash a sentinel twice for the same challenge', async () => {
    const challengedSentinel = sentinels[2]
    const proof = getActorsMerkleProof({
      actor: challengedSentinel,
      type: constants.hub.actors.Sentinel,
    })
    const tx = await hub
      .connect(challenger)
      .startChallenge(challengedSentinel.address, constants.hub.actors.Sentinel, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    const challenge = Challenge.fromReceipt(await tx.wait(1))
    await time.increase(CHALLENGE_DURATION)
    await hub.connect(challenger).slashByChallenge(challenge)
    await expect(hub.connect(challenger).slashByChallenge(challenge))
      .to.be.revertedWithCustomError(hub, 'InvalidChallengeStatus')
      .withArgs(CHALLENGE_STATUS.Unsolved, CHALLENGE_STATUS.Pending)
  })

  it('should be able to solve a challenge of a guardian', async () => {
    const challengedGuardian = guardians[2]
    const proof = getActorsMerkleProof({
      actor: challengedGuardian,
      type: constants.hub.actors.Guardian,
    })

    const tx = await hub
      .connect(challenger)
      .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    const challenge = Challenge.fromReceipt(await tx.wait(1))

    await expect(
      hub
        .connect(broadcaster)
        .solveChallenge(
          challenge,
          constants.hub.actors.Guardian,
          proof,
          await challengedGuardian.signMessage(ethers.utils.arrayify(challenge.id))
        )
    )
      .to.emit(hub, 'ChallengeSolved')
      .withArgs(challenge.serialize())
    expect(await hub.getChallengeStatus(challenge)).to.be.eq(CHALLENGE_STATUS.Solved)
  })

  it('should not be able to solve a challenge of a sentinel because max challenge duration is passed', async () => {
    const challengedGuardian = guardians[2]
    const proof = getActorsMerkleProof({
      actor: challengedGuardian,
      type: constants.hub.actors.Guardian,
    })
    const tx = await hub
      .connect(challenger)
      .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    const challenge = Challenge.fromReceipt(await tx.wait(1))
    await time.increase(CHALLENGE_DURATION)

    await expect(
      hub
        .connect(broadcaster)
        .solveChallenge(
          challenge,
          constants.hub.actors.Guardian,
          proof,
          await challengedGuardian.signMessage(ethers.utils.arrayify(challenge.id))
        )
    ).to.be.revertedWithCustomError(hub, 'ChallengeDurationPassed')
  })

  it('should not be able to solve a challenge of a sentinel by using another sentinel', async () => {
    const challengedGuardian = guardians[2]
    const wrongGuardian = guardians[1]
    const proof = getActorsMerkleProof({
      actor: challengedGuardian,
      type: constants.hub.actors.Guardian,
    })
    const tx = await hub
      .connect(challenger)
      .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    const challenge = Challenge.fromReceipt(await tx.wait(1))
    await expect(
      hub
        .connect(wrongGuardian)
        .solveChallenge(
          challenge,
          constants.hub.actors.Guardian,
          proof,
          await wrongGuardian.signMessage(ethers.utils.arrayify(challenge.id))
        )
    )
      .to.be.revertedWithCustomError(hub, 'InvalidActor')
      .withArgs(wrongGuardian.address, constants.hub.actors.Guardian)
  })

  it('should be able to slash a sentinel', async () => {
    const challengedGuardian = guardians[2]
    const proof = getActorsMerkleProof({
      actor: challengedGuardian,
      type: constants.hub.actors.Guardian,
    })
    let tx = await hub
      .connect(challenger)
      .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    const challenge = Challenge.fromReceipt(await tx.wait(1))
    await time.increase(CHALLENGE_DURATION)

    const balancePre = await ethers.provider.getBalance(challenger.address)

    tx = hub.connect(challenger).slashByChallenge(challenge)
    await expect(tx)
      .to.emit(hub, 'UserOperation')
      .and.to.emit(hub, 'ChallengeUnsolved')
      .withArgs(challenge.serialize())
    const receipt = await (await tx).wait(1)
    const balancePost = await ethers.provider.getBalance(challenger.address)
    expect(balancePost).to.be.eq(
      balancePre
        .add(LOCKED_AMOUNT_START_CHALLENGE)
        .sub(receipt.gasUsed.mul(receipt.effectiveGasPrice))
    )
    expect(await hub.getChallengeStatus(challenge)).to.be.eq(CHALLENGE_STATUS.Unsolved)
  })

  it('should not be able to slash a sentinel if max challenge duration is not passed', async () => {
    const challengedGuardian = guardians[2]
    const proof = getActorsMerkleProof({
      actor: challengedGuardian,
      type: constants.hub.actors.Guardian,
    })
    const tx = await hub
      .connect(challenger)
      .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    const challenge = Challenge.fromReceipt(await tx.wait(1))
    await expect(hub.connect(challenger).slashByChallenge(challenge)).to.be.revertedWithCustomError(
      hub,
      'MaxChallengeDurationNotPassed'
    )
  })

  it('should be able to resume a sentinel after slashing', async () => {
    const challengedGuardian = guardians[2]
    const proof = getActorsMerkleProof({
      actor: challengedGuardian,
      type: constants.hub.actors.Guardian,
    })
    let tx = await hub
      .connect(challenger)
      .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    const challenge = Challenge.fromReceipt(await tx.wait(1))
    await time.increase(CHALLENGE_DURATION)

    const preTotalNumberOfInactiveActors = await getTotalNumberOfInactiveActorsByEpoch(currentEpoch)
    await hub.connect(challenger).slashByChallenge(challenge)
    expect(await getTotalNumberOfInactiveActorsByEpoch(currentEpoch)).to.be.eq(
      preTotalNumberOfInactiveActors + 1
    )

    tx = await governanceMessageEmitter.resumeActor(
      challengedGuardian.address,
      REGISTRATION_KINDS.Guardian
    )
    const receipt = await tx.wait(1)
    const message = receipt.events.find(({ event }) => event === 'GovernanceMessage')

    await expect(
      hub
        .connect(telepathyRouter)
        .handleTelepathy(
          chainId,
          fakeGovernanceMessageVerifier.address,
          abiCoder.decode(['bytes'], message.data)[0]
        )
    )
      .to.emit(hub, 'ActorResumed')
      .withArgs(currentEpoch, challengedGuardian.address)

    expect(await getTotalNumberOfInactiveActorsByEpoch(currentEpoch)).to.be.eq(
      preTotalNumberOfInactiveActors
    )
  })

  it('should be able to slash a sentinel twice for the same challenge', async () => {
    const challengedGuardian = guardians[2]
    const proof = getActorsMerkleProof({
      actor: challengedGuardian,
      type: constants.hub.actors.Guardian,
    })
    const tx = await hub
      .connect(challenger)
      .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    const challenge = Challenge.fromReceipt(await tx.wait(1))
    await time.increase(CHALLENGE_DURATION)
    await hub.connect(challenger).slashByChallenge(challenge)
    await expect(hub.connect(challenger).slashByChallenge(challenge))
      .to.be.revertedWithCustomError(hub, 'InvalidChallengeStatus')
      .withArgs(CHALLENGE_STATUS.Unsolved, CHALLENGE_STATUS.Pending)
  })

  it('should not be able to queue an operation if lock down mode is triggered because there are no sentinels active', async () => {
    const challenges = []
    for (const challengedSentinel of sentinels) {
      const proof = getActorsMerkleProof({
        actor: challengedSentinel,
        type: constants.hub.actors.Sentinel,
      })
      const tx = await hub
        .connect(challenger)
        .startChallenge(challengedSentinel.address, constants.hub.actors.Sentinel, proof, {
          value: LOCKED_AMOUNT_START_CHALLENGE,
        })
      challenges.push(Challenge.fromReceipt(await tx.wait(1)))
    }

    expect(await hub.isLockedDown()).to.be.false

    await time.increase(CHALLENGE_DURATION)

    for (const challenge of challenges) {
      await hub.connect(challenger).slashByChallenge(challenge)
    }

    expect(await hub.isLockedDown()).to.be.true

    await expect(
      hub.connect(relayer).protocolQueueOperation(await generateOperation(), {
        value: LOCKED_AMOUNT_CHALLENGE_PERIOD,
      })
    ).to.be.revertedWithCustomError(hub, 'LockDown')
  })

  it('should not be able to queue an operation if lock down mode is triggered because there are no active guardians', async () => {
    const challenges = []
    for (const challengeGuardin of guardians) {
      const proof = getActorsMerkleProof({
        actor: challengeGuardin,
        type: constants.hub.actors.Guardian,
      })
      const tx = await hub
        .connect(challenger)
        .startChallenge(challengeGuardin.address, constants.hub.actors.Guardian, proof, {
          value: LOCKED_AMOUNT_START_CHALLENGE,
        })
      challenges.push(Challenge.fromReceipt(await tx.wait(1)))
    }

    expect(await hub.isLockedDown()).to.be.false

    await time.increase(CHALLENGE_DURATION)

    for (const challenge of challenges) {
      await hub.connect(challenger).slashByChallenge(challenge)
    }

    expect(await hub.isLockedDown()).to.be.true

    await expect(
      hub.connect(relayer).protocolQueueOperation(await generateOperation(), {
        value: LOCKED_AMOUNT_CHALLENGE_PERIOD,
      })
    ).to.be.revertedWithCustomError(hub, 'LockDown')
  })

  it('should not be able to start a challenge near to the end of an epoch', async () => {
    // |--------------------------------T--SC----|
    // 0                                         1

    const challengedGuardian = guardians[2]
    const proof = getActorsMerkleProof({
      actor: challengedGuardian,
      type: constants.hub.actors.Guardian,
    })
    const startFirstEpochTimestamp = (await epochsManager.startFirstEpochTimestamp()).toNumber()
    const currentEpochEndTimestamp = startFirstEpochTimestamp + (currentEpoch + 1) * epochDuration
    await time.increaseTo(currentEpochEndTimestamp - CHALLENGE_DURATION - 3600 + 1)
    await expect(
      hub
        .connect(challenger)
        .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
          value: LOCKED_AMOUNT_START_CHALLENGE,
        })
    ).to.be.revertedWithCustomError(hub, 'NearToEpochEnd')
  })

  it('should be able to start a challenge when the system is in lock down mode but the end of the epoch is not near to trigger the stopping of starting challenges', async () => {
    // |---------------------------LD----SC----T-----|
    // 0                                             1
    //
    // actor challenghable between OE and T

    const challengedGuardian = guardians[2]
    const proof = getActorsMerkleProof({
      actor: challengedGuardian,
      type: constants.hub.actors.Guardian,
    })
    const startFirstEpochTimestamp = (await epochsManager.startFirstEpochTimestamp()).toNumber()
    const currentEpochEndTimestamp = startFirstEpochTimestamp + (currentEpoch + 1) * epochDuration
    const maxChallengePeriodDuration =
      BASE_CHALLENGE_PERIOD_DURATION +
      MAX_OPERATIONS_IN_QUEUE * MAX_OPERATIONS_IN_QUEUE * K_CHALLENGE_PERIOD -
      K_CHALLENGE_PERIOD

    expect(await hub.isLockedDown()).to.be.false

    await time.increaseTo(currentEpochEndTimestamp - maxChallengePeriodDuration - 3600 + 1)

    expect(await hub.isLockedDown()).to.be.true

    await expect(
      hub.connect(relayer).protocolQueueOperation(await generateOperation(), {
        value: LOCKED_AMOUNT_CHALLENGE_PERIOD,
      })
    ).to.be.revertedWithCustomError(hub, 'LockDown')

    await expect(
      hub
        .connect(challenger)
        .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
          value: LOCKED_AMOUNT_START_CHALLENGE,
        })
    ).to.not.be.revertedWithCustomError(hub, 'NearToEpochEnd')
  })

  it('should be able to resolve a challenge near to the end of an epoch', async () => {
    // |---------------------------SC---T-RC-----|
    // 0                                         1

    const challengedGuardian = guardians[2]
    const proof = getActorsMerkleProof({
      actor: challengedGuardian,
      type: constants.hub.actors.Guardian,
    })
    const startFirstEpochTimestamp = (await epochsManager.startFirstEpochTimestamp()).toNumber()
    const currentEpochEndTimestamp = startFirstEpochTimestamp + (currentEpoch + 1) * epochDuration
    await time.increaseTo(currentEpochEndTimestamp - CHALLENGE_DURATION - 3600 - 1)
    const tx = await hub
      .connect(challenger)
      .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    const challenge = Challenge.fromReceipt(await tx.wait(1))

    await expect(
      hub.connect(broadcaster).solveChallenge(
        challenge,
        constants.hub.actors.Guardian,

        proof,
        await challengedGuardian.signMessage(ethers.utils.arrayify(challenge.id))
      )
    )
      .to.emit(hub, 'ChallengeSolved')
      .withArgs(challenge.serialize())
  })

  it('should be able to slash a guardian near to the end of an epoch', async () => {
    // |---------------------------SC---T------SG-|
    // 0                                          1

    const challengedGuardian = guardians[2]
    const proof = getActorsMerkleProof({
      actor: challengedGuardian,
      type: constants.hub.actors.Guardian,
    })
    const startFirstEpochTimestamp = (await epochsManager.startFirstEpochTimestamp()).toNumber()
    const currentEpochEndTimestamp = startFirstEpochTimestamp + (currentEpoch + 1) * epochDuration
    await time.increaseTo(currentEpochEndTimestamp - CHALLENGE_DURATION - 3600 - 1)
    const tx = await hub
      .connect(challenger)
      .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    const challenge = Challenge.fromReceipt(await tx.wait(1))

    await time.setNextBlockTimestamp(currentEpochEndTimestamp - 10)

    await expect(
      hub.connect(broadcaster).solveChallenge(
        challenge,
        constants.hub.actors.Guardian,

        proof,
        await challengedGuardian.signMessage(ethers.utils.arrayify(challenge.id))
      )
    ).to.be.revertedWithCustomError(hub, 'ChallengeDurationPassed')

    await time.setNextBlockTimestamp(currentEpochEndTimestamp - 1)

    await expect(hub.connect(challengedGuardian).slashByChallenge(challenge)).to.emit(
      hub,
      'UserOperation'
    )
  })

  it('should not be able to resolve a challenge started in the previous epoch', async () => {
    // |---------------------------SC---T--------|-----RC-------------------------------|
    // 0                                         1                                      2

    const challengedGuardian = guardians[2]
    const proof = getActorsMerkleProof({
      actor: challengedGuardian,
      type: constants.hub.actors.Guardian,
    })
    const startFirstEpochTimestamp = (await epochsManager.startFirstEpochTimestamp()).toNumber()
    const currentEpochEndTimestamp = startFirstEpochTimestamp + (currentEpoch + 1) * epochDuration
    await time.increaseTo(currentEpochEndTimestamp - CHALLENGE_DURATION - 3600 - 1)
    const tx = await hub
      .connect(challenger)
      .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    const challenge = Challenge.fromReceipt(await tx.wait(1))

    await time.increaseTo(currentEpochEndTimestamp + 1)
    await propagateActors({ guardians, sentinels })

    await expect(
      hub.connect(broadcaster).solveChallenge(
        challenge,
        constants.hub.actors.Guardian,

        proof,
        await challengedGuardian.signMessage(ethers.utils.arrayify(challenge.id))
      )
    ).to.be.revertedWithCustomError(hub, 'ChallengeNotFound')

    await expect(hub.connect(challenger).slashByChallenge(challenge)).to.be.revertedWithCustomError(
      hub,
      'ChallengeNotFound'
    )
  })

  it('should be able enter and exit from lock down mode because of defaultActors inactivity', async () => {
    const challenges = []
    let tx
    for (const challengedGuardian of guardians) {
      const proof = getActorsMerkleProof({
        actor: challengedGuardian,
        type: constants.hub.actors.Guardian,
      })
      tx = await hub
        .connect(challenger)
        .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
          value: LOCKED_AMOUNT_START_CHALLENGE,
        })
      challenges.push(Challenge.fromReceipt(await tx.wait(1)))
    }

    for (const challengedSentinel of sentinels) {
      const proof = getActorsMerkleProof({
        actor: challengedSentinel,
        type: constants.hub.actors.Sentinel,
      })
      tx = await hub
        .connect(challenger)
        .startChallenge(challengedSentinel.address, constants.hub.actors.Sentinel, proof, {
          value: LOCKED_AMOUNT_START_CHALLENGE,
        })
      challenges.push(Challenge.fromReceipt(await tx.wait(1)))
    }

    await time.increase(CHALLENGE_DURATION)

    for (const challenge of challenges) {
      await hub.connect(challenger).slashByChallenge(challenge)
    }

    expect(await hub.isLockedDown()).to.be.true

    await expect(
      hub.connect(relayer).protocolQueueOperation(await generateOperation(), {
        value: LOCKED_AMOUNT_CHALLENGE_PERIOD,
      })
    ).to.be.revertedWithCustomError(hub, 'LockDown')

    tx = await governanceMessageEmitter.resumeActor(
      guardians[0].address,
      REGISTRATION_KINDS.Guardian
    )
    let receipt = await tx.wait(1)
    let message = receipt.events.find(({ event }) => event === 'GovernanceMessage')

    await expect(
      hub
        .connect(telepathyRouter)
        .handleTelepathy(
          chainId,
          fakeGovernanceMessageVerifier.address,
          abiCoder.decode(['bytes'], message.data)[0]
        )
    )
      .to.emit(hub, 'ActorResumed')
      .withArgs(currentEpoch, guardians[0].address)

    expect(await hub.isLockedDown()).to.be.true

    tx = await governanceMessageEmitter.resumeActor(
      sentinels[0].address,
      REGISTRATION_KINDS.StakingSentinel
    )
    receipt = await tx.wait(1)
    message = receipt.events.find(({ event }) => event === 'GovernanceMessage')

    await expect(
      hub
        .connect(telepathyRouter)
        .handleTelepathy(
          chainId,
          fakeGovernanceMessageVerifier.address,
          abiCoder.decode(['bytes'], message.data)[0]
        )
    )
      .to.emit(hub, 'ActorResumed')
      .withArgs(currentEpoch, sentinels[0].address)

    expect(await hub.isLockedDown()).to.be.false

    const operation = await generateOperation()
    tx = hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await expect(tx).to.emit(hub, 'OperationQueued').withArgs(operation.serialize())
  })

  it('should trigger lock down mode if a new epoch starts and no merkle root have been received yet', async () => {
    const preCurrentEpoch = currentEpoch
    await time.increase(epochDuration)
    expect(preCurrentEpoch + 1).to.be.eq(await epochsManager.currentEpoch())

    await expect(
      hub.connect(relayer).protocolQueueOperation(await generateOperation(), {
        value: LOCKED_AMOUNT_CHALLENGE_PERIOD,
      })
    ).to.be.revertedWithCustomError(hub, 'LockDown')
    expect(await hub.isLockedDown()).to.be.true

    await propagateActors({ guardians, sentinels })

    expect(await hub.isLockedDown()).to.be.false

    const operation = await generateOperation()
    const tx = hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })
    await expect(tx).to.emit(hub, 'OperationQueued').withArgs(operation.serialize())
  })

  it('should not be able to challenge a guardian or a sentinel that are not registered within the next epoch but that they were in the previous one', async () => {
    const preCurrentEpoch = currentEpoch
    await time.increase(epochDuration)
    expect(preCurrentEpoch + 1).to.be.eq(await epochsManager.currentEpoch())

    const guardianNotRegistered = guardians[0]
    const sentinelNotRegistered = sentinels[0]
    await propagateActors({ sentinels: sentinels.slice(1), guardians: guardians.slice(1) })

    let proof = getActorsMerkleProof({
      actor: guardianNotRegistered,
      type: constants.hub.actors.Guardian,
    })
    await expect(
      hub
        .connect(challenger)
        .startChallenge(guardianNotRegistered.address, constants.hub.actors.Guardian, proof, {
          value: LOCKED_AMOUNT_START_CHALLENGE,
        })
    ).to.be.revertedWithCustomError(hub, 'InvalidActor')

    proof = getActorsMerkleProof({
      actor: sentinelNotRegistered,
      type: constants.hub.actors.Sentinel,
    })
    await expect(
      hub
        .connect(challenger)
        .startChallenge(sentinelNotRegistered.address, constants.hub.actors.Sentinel, proof, {
          value: LOCKED_AMOUNT_START_CHALLENGE,
        })
    ).to.be.revertedWithCustomError(hub, 'InvalidActor')
  })

  it('should be able to claim lockedAmountStartChallenge in the next epoch', async () => {
    const challengedGuardian = guardians[2]
    const proof = getActorsMerkleProof({
      actor: challengedGuardian,
      type: constants.hub.actors.Guardian,
    })

    let tx = await hub
      .connect(challenger)
      .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    const challenge = Challenge.fromReceipt(await tx.wait(1))

    const startFirstEpochTimestamp = (await epochsManager.startFirstEpochTimestamp()).toNumber()
    const currentEpochEndTimestamp = startFirstEpochTimestamp + (currentEpoch + 1) * epochDuration
    await time.increaseTo(currentEpochEndTimestamp + 1)

    const challengerPreBalance = await ethers.provider.getBalance(challenger.address)
    tx = hub.connect(challenger).claimLockedAmountStartChallenge(challenge)
    await expect(tx).to.be.emit(hub, 'ChallengePartiallyUnsolved').withArgs(challenge.serialize())
    const receipt = await (await tx).wait(1)

    const challengerPostBalance = await ethers.provider.getBalance(challenger.address)

    expect(challengerPostBalance).to.be.eq(
      challengerPreBalance
        .add(LOCKED_AMOUNT_START_CHALLENGE)
        .sub(receipt.gasUsed.mul(receipt.effectiveGasPrice))
    )
  })

  it('should not be able to claim lockedAmountStartChallenge in the next epoch twice', async () => {
    const challengedGuardian = guardians[2]
    const proof = getActorsMerkleProof({
      actor: challengedGuardian,
      type: constants.hub.actors.Guardian,
    })

    const tx = await hub
      .connect(challenger)
      .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    const challenge = Challenge.fromReceipt(await tx.wait(1))
    const startFirstEpochTimestamp = (await epochsManager.startFirstEpochTimestamp()).toNumber()
    const currentEpochEndTimestamp = startFirstEpochTimestamp + (currentEpoch + 1) * epochDuration
    await time.increaseTo(currentEpochEndTimestamp + 1)
    await expect(hub.connect(challenger).claimLockedAmountStartChallenge(challenge))
      .to.be.emit(hub, 'ChallengePartiallyUnsolved')
      .withArgs(challenge.serialize())
    await expect(hub.connect(challenger).claimLockedAmountStartChallenge(challenge))
      .to.be.revertedWithCustomError(hub, 'InvalidChallengeStatus')
      .withArgs(CHALLENGE_STATUS.PartiallyUnsolved, CHALLENGE_STATUS.Pending)
  })

  it('should not be able to claim lockedAmountStartChallenge in the epoch in which the challenge was opened', async () => {
    const challengedGuardian = guardians[2]
    const proof = getActorsMerkleProof({
      actor: challengedGuardian,
      type: constants.hub.actors.Guardian,
    })

    const tx = await hub
      .connect(challenger)
      .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    const challenge = Challenge.fromReceipt(await tx.wait(1))
    await expect(
      hub.connect(challenger).claimLockedAmountStartChallenge(challenge)
    ).to.be.revertedWithCustomError(hub, 'InvalidEpoch')
  })

  it('should not be able to claim lockedAmountStartChallenge for a challenge that does not exist', async () => {
    const challengedGuardian = guardians[2]
    const proof = getActorsMerkleProof({
      actor: challengedGuardian,
      type: constants.hub.actors.Guardian,
    })

    const startFirstEpochTimestamp = (await epochsManager.startFirstEpochTimestamp()).toNumber()
    const currentEpochEndTimestamp = startFirstEpochTimestamp + (currentEpoch + 1) * epochDuration

    const tx = await hub
      .connect(challenger)
      .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    const challenge = Challenge.fromReceipt(await tx.wait(1))

    await time.increaseTo(currentEpochEndTimestamp + 1)

    const fakeChallenge = new Challenge({
      actor: challenge.actor,
      actorType: challenge.actorType,
      challenger: challenge.challenger,
      nonce: challenge.nonce + 1,
      timestamp: challenge.timestamp,
    })

    await expect(
      hub.connect(challenger).claimLockedAmountStartChallenge(fakeChallenge)
    ).to.be.revertedWithCustomError(hub, 'ChallengeNotFound')
  })

  it('should be able to exit from lock down mode after an hard-resume', async () => {
    const challenges = []
    let tx
    for (const challengedGuardian of guardians) {
      const proof = getActorsMerkleProof({
        actor: challengedGuardian,
        type: constants.hub.actors.Guardian,
      })
      tx = await hub
        .connect(challenger)
        .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
          value: LOCKED_AMOUNT_START_CHALLENGE,
        })
      challenges.push(Challenge.fromReceipt(await tx.wait(1)))
    }

    for (const challengedSentinel of sentinels) {
      const proof = getActorsMerkleProof({
        actor: challengedSentinel,
        type: constants.hub.actors.Sentinel,
      })
      tx = await hub
        .connect(challenger)
        .startChallenge(challengedSentinel.address, constants.hub.actors.Sentinel, proof, {
          value: LOCKED_AMOUNT_START_CHALLENGE,
        })
      challenges.push(Challenge.fromReceipt(await tx.wait(1)))
    }

    await time.increase(CHALLENGE_DURATION)

    for (const challenge of challenges) {
      await hub.connect(challenger).slashByChallenge(challenge)
    }

    expect(await hub.isLockedDown()).to.be.true

    await expect(
      hub.connect(relayer).protocolQueueOperation(await generateOperation(), {
        value: LOCKED_AMOUNT_CHALLENGE_PERIOD,
      })
    ).to.be.revertedWithCustomError(hub, 'LockDown')

    // sentinel1 is slashed and a GOVERNANCE_MESSAGE_SLASH_ACTOR message is emitted
    const slashedSentinel = sentinels[1]
    tx = await governanceMessageEmitter.slashActor(
      slashedSentinel.address,
      REGISTRATION_KINDS.StakingSentinel
    )
    let receipt = await tx.wait(1)
    let message = receipt.events.find(({ event }) => event === 'GovernanceMessage')

    await hub
      .connect(telepathyRouter)
      .handleTelepathy(
        chainId,
        fakeGovernanceMessageVerifier.address,
        abiCoder.decode(['bytes'], message.data)[0]
      )

    // At this point sentinel1 should resume itself
    tx = await governanceMessageEmitter.resumeActor(
      slashedSentinel.address,
      REGISTRATION_KINDS.BorrowingSentinel
    )
    receipt = await tx.wait(1)
    message = receipt.events.find(({ event }) => event === 'GovernanceMessage')

    await expect(
      hub
        .connect(telepathyRouter)
        .handleTelepathy(
          chainId,
          fakeGovernanceMessageVerifier.address,
          abiCoder.decode(['bytes'], message.data)[0]
        )
    )
      .to.emit(hub, 'ActorResumed')
      .withArgs(currentEpoch, slashedSentinel.address)

    tx = await governanceMessageEmitter.resumeActor(guardian.address, REGISTRATION_KINDS.Guardian)
    receipt = await tx.wait(1)
    message = receipt.events.find(({ event }) => event === 'GovernanceMessage')

    await expect(
      hub
        .connect(telepathyRouter)
        .handleTelepathy(
          chainId,
          fakeGovernanceMessageVerifier.address,
          abiCoder.decode(['bytes'], message.data)[0]
        )
    )
      .to.emit(hub, 'ActorResumed')
      .withArgs(currentEpoch, guardian.address)

    expect(await hub.isLockedDown()).to.be.false

    // At this point system should exit from lock down mode
    const operation = await generateOperation()
    await expect(
      hub.connect(relayer).protocolQueueOperation(operation, {
        value: LOCKED_AMOUNT_CHALLENGE_PERIOD,
      })
    ).not.to.be.revertedWithCustomError(hub, 'LockDown')

    expect(await getTotalNumberOfInactiveActorsByEpoch(currentEpoch)).to.be.eq(
      sentinels.length + guardians.length - 2
    )
    await hub
      .connect(broadcaster)
      .protocolCancelOperation(
        operation,
        constants.hub.actors.Guardian,
        getActorsMerkleProof({ actor: guardian, type: constants.hub.actors.Guardian }),
        await guardian.signMessage(ethers.utils.arrayify(operation.id))
      )
    await expect(
      hub
        .connect(broadcaster)
        .protocolCancelOperation(
          operation,
          constants.hub.actors.Sentinel,
          getActorsMerkleProof({ actor: slashedSentinel, type: constants.hub.actors.Sentinel }),
          await slashedSentinel.signMessage(ethers.utils.arrayify(operation.id))
        )
    )
      .to.emit(hub, 'OperationCancelFinalized')
      .withArgs(operation.serialize())
  })

  it('should trigger lock down mode even when slash comes from other chains', async () => {
    const challenges = []
    let tx
    for (const challengedGuardian of guardians) {
      const proof = getActorsMerkleProof({
        actor: challengedGuardian,
        type: constants.hub.actors.Guardian,
      })
      tx = await hub
        .connect(challenger)
        .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
          value: LOCKED_AMOUNT_START_CHALLENGE,
        })
      challenges.push(Challenge.fromReceipt(await tx.wait(1)))
    }

    await time.increase(CHALLENGE_DURATION)

    for (const challenge of challenges) {
      await hub.connect(challenger).slashByChallenge(challenge)
    }

    const messages = []
    for (const slashedSentinel of sentinels) {
      tx = await governanceMessageEmitter.slashActor(
        slashedSentinel.address,
        REGISTRATION_KINDS.StakingSentinel
      )
      const receipt = await tx.wait(1)
      messages.push(receipt.events.find(({ event }) => event === 'GovernanceMessage'))
    }

    let i = 0
    for (const message of messages) {
      await expect(
        hub
          .connect(telepathyRouter)
          .handleTelepathy(
            chainId,
            fakeGovernanceMessageVerifier.address,
            abiCoder.decode(['bytes'], message.data)[0]
          )
      )
        .to.emit(hub, 'ActorSlashed')
        .withArgs(currentEpoch, sentinels[i].address)
      i++
    }

    expect(await hub.isLockedDown()).to.be.true

    await expect(
      hub.connect(relayer).protocolQueueOperation(await generateOperation(), {
        value: LOCKED_AMOUNT_CHALLENGE_PERIOD,
      })
    ).to.be.revertedWithCustomError(hub, 'LockDown')
  })

  it('should be able to correctly handling the pending challenge for an actor', async () => {
    const challengedGuardian = guardians[0]
    const proof = getActorsMerkleProof({
      actor: challengedGuardian,
      type: constants.hub.actors.Guardian,
    })
    let tx = await hub
      .connect(challenger)
      .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    let challenge = Challenge.fromReceipt(await tx.wait(1))

    let expectedChallengeId = await hub.challengeIdOf(challenge)
    expect(
      await hub.getPendingChallengeIdByEpochOf(currentEpoch, challengedGuardian.address)
    ).to.be.eq(expectedChallengeId)

    await time.increase(CHALLENGE_DURATION)
    await hub.connect(challenger).slashByChallenge(challenge)
    expect(
      await hub.getPendingChallengeIdByEpochOf(currentEpoch, challengedGuardian.address)
    ).to.be.eq('0x'.padEnd(66, '0'))

    tx = await governanceMessageEmitter.resumeActor(
      challengedGuardian.address,
      REGISTRATION_KINDS.Guardian
    )
    const receipt = await tx.wait(1)
    const message = receipt.events.find(({ event }) => event === 'GovernanceMessage')
    await hub
      .connect(telepathyRouter)
      .handleTelepathy(
        chainId,
        fakeGovernanceMessageVerifier.address,
        abiCoder.decode(['bytes'], message.data)[0]
      )

    tx = await hub
      .connect(challenger)
      .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    challenge = Challenge.fromReceipt(await tx.wait(1))

    expectedChallengeId = await hub.challengeIdOf(challenge)
    expect(
      await hub.getPendingChallengeIdByEpochOf(currentEpoch, challengedGuardian.address)
    ).to.be.eq(expectedChallengeId)

    await hub.connect(broadcaster).solveChallenge(
      challenge,
      constants.hub.actors.Guardian,

      proof,
      await challengedGuardian.signMessage(ethers.utils.arrayify(challenge.id))
    )
    expect(
      await hub.getPendingChallengeIdByEpochOf(currentEpoch, challengedGuardian.address)
    ).to.be.eq('0x'.padEnd(66, '0'))
  })

  it('should appropriately manage an ongoing challenge when a GOVERNANCE_MESSAGE_SLASH_ACTOR is received for the sentinel involved in that challenge in order to trigger lock down mode', async () => {
    const challenges = []
    let tx
    for (const challengedGuardian of guardians) {
      const proof = getActorsMerkleProof({
        actor: challengedGuardian,
        type: constants.hub.actors.Guardian,
      })
      tx = await hub
        .connect(challenger)
        .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
          value: LOCKED_AMOUNT_START_CHALLENGE,
        })
      challenges.push(Challenge.fromReceipt(await tx.wait(1)))
    }

    const effectiveSentinels = sentinels.slice(1)
    for (const challengedSentinel of effectiveSentinels) {
      const proof = getActorsMerkleProof({
        actor: challengedSentinel,
        type: constants.hub.actors.Sentinel,
      })
      tx = await hub
        .connect(challenger)
        .startChallenge(challengedSentinel.address, constants.hub.actors.Sentinel, proof, {
          value: LOCKED_AMOUNT_START_CHALLENGE,
        })
      challenges.push(Challenge.fromReceipt(await tx.wait(1)))
    }

    await time.increase(CHALLENGE_DURATION)
    for (const challenge of challenges) {
      await hub.connect(challenger).slashByChallenge(challenge)
    }

    expect(await getTotalNumberOfInactiveActorsByEpoch(currentEpoch)).to.be.eq(
      sentinels.length + guardians.length - 1
    )

    const slashedSentinel = sentinels[0]
    const proof = getActorsMerkleProof({
      actor: slashedSentinel,
      type: constants.hub.actors.Sentinel,
    })
    tx = await hub
      .connect(challenger)
      .startChallenge(slashedSentinel.address, constants.hub.actors.Sentinel, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })

    const challengerBalancePre = await ethers.provider.getBalance(challenger.address)

    const challenge = Challenge.fromReceipt(await tx.wait(1))
    const expectedChallengeId = await hub.challengeIdOf(challenge)
    expect(
      await hub.getPendingChallengeIdByEpochOf(currentEpoch, slashedSentinel.address)
    ).to.be.eq(expectedChallengeId)

    tx = await governanceMessageEmitter.slashActor(
      slashedSentinel.address,
      REGISTRATION_KINDS.StakingSentinel
    )
    const receipt = await tx.wait(1)
    const message = receipt.events.find(({ event }) => event === 'GovernanceMessage')
    // NOTE: At this point the sentinel should be slashed and the pending challenge should be cancelled
    await expect(
      hub
        .connect(telepathyRouter)
        .handleTelepathy(
          chainId,
          fakeGovernanceMessageVerifier.address,
          abiCoder.decode(['bytes'], message.data)[0]
        )
    )
      .to.emit(hub, 'ChallengeCancelled')
      .withArgs(challenge.serialize())
      .and.to.emit(hub, 'ActorSlashed')
      .withArgs(currentEpoch, slashedSentinel.address)

    expect(await hub.getChallengeStatus(challenge)).to.be.eq(CHALLENGE_STATUS.Cancelled)

    const challengerBalancePost = await ethers.provider.getBalance(challenger.address)
    expect(challengerBalancePost).to.be.eq(challengerBalancePre.add(LOCKED_AMOUNT_START_CHALLENGE))

    expect(
      await hub.getPendingChallengeIdByEpochOf(currentEpoch, slashedSentinel.address)
    ).to.be.eq('0x'.padEnd(66, '0'))

    await expect(
      hub.connect(relayer).protocolQueueOperation(await generateOperation(), {
        value: LOCKED_AMOUNT_CHALLENGE_PERIOD,
      })
    ).to.be.revertedWithCustomError(hub, 'LockDown')
  })

  it('should not be able to solve or slash a cancelled challenge', async () => {
    const slashedSentinel = sentinels[0]
    const proof = getActorsMerkleProof({
      actor: slashedSentinel,
      type: constants.hub.actors.Sentinel,
    })
    let tx = await hub
      .connect(challenger)
      .startChallenge(slashedSentinel.address, constants.hub.actors.Sentinel, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })
    const challenge = Challenge.fromReceipt(await tx.wait(1))

    tx = await governanceMessageEmitter.slashActor(
      slashedSentinel.address,
      REGISTRATION_KINDS.StakingSentinel
    )
    const receipt = await tx.wait(1)
    const message = receipt.events.find(({ event }) => event === 'GovernanceMessage')
    // cancel challenge
    await hub
      .connect(telepathyRouter)
      .handleTelepathy(
        chainId,
        fakeGovernanceMessageVerifier.address,
        abiCoder.decode(['bytes'], message.data)[0]
      )

    await expect(hub.connect(challenger).slashByChallenge(challenge))
      .to.be.revertedWithCustomError(hub, 'InvalidChallengeStatus')
      .withArgs(CHALLENGE_STATUS.Cancelled, CHALLENGE_STATUS.Pending)

    await expect(
      hub
        .connect(broadcaster)
        .solveChallenge(
          challenge,
          constants.hub.actors.Sentinel,
          proof,
          await slashedSentinel.signMessage(ethers.utils.arrayify(challenge.id))
        )
    )
      .to.be.revertedWithCustomError(hub, 'InvalidChallengeStatus')
      .withArgs(CHALLENGE_STATUS.Cancelled, CHALLENGE_STATUS.Pending)
  })

  // it('should adjust the challenge period based on the number of current active defaultActors', async () => {
  //   const operation = await generateOperation()
  //   await hub
  //     .connect(relayer)
  //     .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })

  //   const challenges = []
  //   let tx
  //   for (const challengedGuardian of guardians) {
  //     const proof = getActorsMerkleProof({ actor: challengedGuardian, type: constants.hub.actors.Guardian })
  //     tx = await hub
  //       .connect(challenger)
  //       .startChallenge(challengedGuardian.address, constants.hub.actors.Guardian, proof, {
  //         value: LOCKED_AMOUNT_START_CHALLENGE,
  //       })
  //     challenges.push(Challenge.fromReceipt(await tx.wait(1)))
  //   }

  //   for (const challengedSentinel of sentinels) {
  //     const proof = getActorsMerkleProof({ actor: challengedSentinel, type: constants.hub.actors.Sentinel })
  //     tx = await hub
  //       .connect(challenger)
  //       .startChallenge(challengedSentinel.address, constants.hub.actors.Sentinel, proof, {
  //         value: LOCKED_AMOUNT_START_CHALLENGE,
  //       })
  //     challenges.push(Challenge.fromReceipt(await tx.wait(1)))
  //   }

  //   await time.increase(CHALLENGE_DURATION)
  //   for (const challenge of challenges) {
  //     await hub.connect(challenger).slashByChallenge(challenge)
  //   }

  //   let activeActors = 0
  //   for (const sentinel of sentinels) {
  //     const [startTimestamp, endTimestamp] = await hub.challengePeriodOf(operation)
  //     const currentQueuedOperationsAdjustmentDuration =
  //       await hub.getCurrentQueuedOperationsAdjustmentDuration()
  //     const expectedCurrentChallengePeriodDuration =
  //       Math.trunc(2.592e6 / (activeActors ** 5 + 1)) +
  //       currentQueuedOperationsAdjustmentDuration.toNumber()
  //     expect(expectedCurrentChallengePeriodDuration).to.be.eq(endTimestamp.sub(startTimestamp))

  //     tx = await governanceMessageEmitter.resumeActor(sentinel.address, REGISTRATION_KINDS.Sentinel)
  //     const receipt = await tx.wait(1)
  //     const message = receipt.events.find(({ event }) => event === 'GovernanceMessage')
  //     await hub
  //       .connect(telepathyRouter)
  //       .handleTelepathy(
  //         chainId,
  //         fakeGovernanceMessageVerifier.address,
  //         abiCoder.decode(['bytes'], message.data)[0]
  //       )

  //     activeActors++
  //   }

  //   for (const guardian of guardians) {
  //     const [startTimestamp, endTimestamp] = await hub.challengePeriodOf(operation)

  //     const currentQueuedOperationsAdjustmentDuration =
  //       await hub.getCurrentQueuedOperationsAdjustmentDuration()
  //     const expectedCurrentChallengePeriodDuration =
  //       Math.trunc(2.592e6 / (activeActors ** 5 + 1)) +
  //       currentQueuedOperationsAdjustmentDuration.toNumber()
  //     expect(expectedCurrentChallengePeriodDuration).to.be.eq(endTimestamp.sub(startTimestamp))

  //     tx = await governanceMessageEmitter.resumeActor(guardian.address, REGISTRATION_KINDS.Guardian)
  //     const receipt = await tx.wait(1)
  //     const message = receipt.events.find(({ event }) => event === 'GovernanceMessage')
  //     await hub
  //       .connect(telepathyRouter)
  //       .handleTelepathy(
  //         chainId,
  //         fakeGovernanceMessageVerifier.address,
  //         abiCoder.decode(['bytes'], message.data)[0]
  //       )

  //     activeActors++
  //   }
  // })

  it('should slash an actor(sentinel) successfully on the interim chain', async () => {
    const slashedSentinel = sentinels[0]
    await mockRegistrationManager.addStakingSentinel(
      sentinel.address,
      owner.address,
      0,
      10,
      BigInt(200000)
    )

    const proof = getActorsMerkleProof({
      actor: slashedSentinel,
      type: constants.hub.actors.Sentinel,
    })
    let tx = await hub
      .connect(challenger)
      .startChallenge(slashedSentinel.address, constants.hub.actors.Sentinel, proof, {
        value: LOCKED_AMOUNT_START_CHALLENGE,
      })

    const challenge = Challenge.fromReceipt(await tx.wait(1))

    await expect(hub.connect(challenger).slashByChallenge(challenge)).to.be.revertedWithCustomError(
      hub,
      'MaxChallengeDurationNotPassed'
    )

    // Increase time
    time.increase(CHALLENGE_DURATION)

    const encodedBytes = ethers.utils.defaultAbiCoder.encode(
      ['address', 'address'],
      [slashedSentinel.address, challenger.address]
    )

    let nonce = anyValue // gasLeft
    const originAccount = hub.address.toLowerCase()
    const destinationAccount = slasher.address.toLowerCase()
    const destinationNetworkId = PNETWORK_NETWORK_IDS.ethereumMainnet // interim network id is set on Ethereum mainne
    const underlyingAssetName = ''
    const underlyingAssetSymbol = ''
    const underlyingAssetDecimals = 0
    const underlyingAssetTokenAddress = ZERO_ADDRESS
    const underlyingAssetNetworkId = '0x00000000'
    const assetTokenAddress = ZERO_ADDRESS
    const assetAmount = 0
    const userDataProtocolFeeAssetAmount = 0
    const networkFeeAssetAmount = 0
    const forwardNetworkFeeAssetAmount = 0
    const forwardDestinationNetworkId = '0x00000000'
    const userData = encodedBytes
    const optionsMask = '0x0000000000000000000000000000000000000000000000000000000000000000'
    const isForProtocol = true
    const expectedEvent = [
      nonce,
      originAccount,
      destinationAccount,
      destinationNetworkId,
      underlyingAssetName,
      underlyingAssetSymbol,
      underlyingAssetDecimals,
      underlyingAssetTokenAddress,
      underlyingAssetNetworkId,
      assetTokenAddress,
      assetAmount,
      userDataProtocolFeeAssetAmount,
      networkFeeAssetAmount,
      forwardNetworkFeeAssetAmount,
      forwardDestinationNetworkId,
      userData,
      optionsMask,
      isForProtocol,
    ]
    tx = await hub.connect(challenger).slashByChallenge(challenge)
    await expect(tx).not.to.be.reverted
    await expect(tx)
      .to.emit(hub, 'UserOperation')
      .withArgs(...expectedEvent)

    const receipt = await tx.wait()
    const event = receipt.events.find(({ event }) => event === 'UserOperation')

    nonce = event.args[0]

    const originTxHash = tx.hash
    const originBlockHash = tx.blockHash
    const operation = new Operation({
      originTxHash,
      originBlockHash,
      nonce,
      originAccount,
      destinationAccount,
      destinationNetworkId,
      underlyingAssetName,
      underlyingAssetSymbol,
      underlyingAssetDecimals,
      underlyingAssetTokenAddress,
      underlyingAssetNetworkId,
      assetTokenAddress,
      assetAmount,
      userDataProtocolFeeAssetAmount,
      networkFeeAssetAmount,
      forwardNetworkFeeAssetAmount,
      forwardDestinationNetworkId,
      userData,
      optionsMask,
      isForProtocol,
    })

    tx = await hubInterim
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })

    await expect(tx).to.emit(hubInterim, 'OperationQueued').withArgs(operation.serialize())

    await expect(
      hubInterim.connect(relayer).protocolExecuteOperation(operation)
    ).to.be.revertedWithCustomError(hubInterim, 'ChallengePeriodNotTerminated')

    time.increase(maxChallengePeriod)

    tx = await hubInterim.connect(relayer).protocolExecuteOperation(operation)
    const currentEpoch = await epochsManager.currentEpoch()
    const tag = ethers.utils.keccak256(Buffer.from('GOVERNANCE_MESSAGE_SLASH_ACTOR'))
    const expectedGovernanceMessageArgs = ethers.utils.defaultAbiCoder.encode(
      ['bytes32', 'bytes'],
      [
        tag,
        ethers.utils.defaultAbiCoder.encode(
          ['uint16', 'address', 'uint8'],
          [currentEpoch, sentinel.address, constants.hub.actors.Sentinel]
        ),
      ]
    )

    await expect(tx)
      .to.emit(hubInterim, 'OperationExecuted')
      .withArgs(operation.serialize())
      .and.to.emit(mockRegistrationManager, 'StakingSentinelSlashed')
      .withArgs(sentinel.address, SLASHING_QUANTITY)
      .and.to.emit(governanceMessageEmitter, 'GovernanceMessage')
      .withArgs(expectedGovernanceMessageArgs)
  })

  it('should not be able to cancel an operation if an actor is inactive', async () => {
    const operation = await generateOperation()
    await hub
      .connect(relayer)
      .protocolQueueOperation(operation, { value: LOCKED_AMOUNT_CHALLENGE_PERIOD })

    const slashedSentinel = sentinels[0]
    const slashedGuardian = guardians[0]

    let tx = await governanceMessageEmitter.slashActor(
      slashedSentinel.address,
      REGISTRATION_KINDS.StakingSentinel
    )
    let receipt = await tx.wait(1)
    let message = receipt.events.find(({ event }) => event === 'GovernanceMessage')
    await hub
      .connect(telepathyRouter)
      .handleTelepathy(
        chainId,
        fakeGovernanceMessageVerifier.address,
        abiCoder.decode(['bytes'], message.data)[0]
      )

    tx = await governanceMessageEmitter.slashActor(
      slashedGuardian.address,
      REGISTRATION_KINDS.Guardian
    )
    receipt = await tx.wait(1)
    message = receipt.events.find(({ event }) => event === 'GovernanceMessage')
    await hub
      .connect(telepathyRouter)
      .handleTelepathy(
        chainId,
        fakeGovernanceMessageVerifier.address,
        abiCoder.decode(['bytes'], message.data)[0]
      )

    await expect(
      hub
        .connect(broadcaster)
        .protocolCancelOperation(
          operation,
          constants.hub.actors.Sentinel,
          getActorsMerkleProof({ actor: slashedSentinel, type: constants.hub.actors.Sentinel }),
          await slashedSentinel.signMessage(ethers.utils.arrayify(operation.id))
        )
    ).to.be.revertedWithCustomError(hub, 'Inactive')

    await expect(
      hub
        .connect(broadcaster)
        .protocolCancelOperation(
          operation,
          constants.hub.actors.Guardian,
          getActorsMerkleProof({ actor: slashedGuardian, type: constants.hub.actors.Guardian }),
          await slashedGuardian.signMessage(ethers.utils.arrayify(operation.id))
        )
    ).to.be.revertedWithCustomError(hub, 'Inactive')
  })
})
