const { expect } = require('chai')
const { ethers } = require('hardhat')
const { MerkleTree } = require('merkletreejs')

let governanceMessagePropagator,
  epochsManager,
  lendingManager,
  registrationManager,
  signers,
  currentEpoch,
  owner

describe('GovernanceMessagePropagator', () => {
  const getMerkleRoot = _addresses => {
    const merkleTree = new MerkleTree(_addresses, ethers.utils.keccak256, {
      sortPairs: true,
      hashLeaves: true,
    })
    return merkleTree.getHexRoot()
  }

  const verifyMerkleProof = (_addresses, _proof, _address, _root) => {
    const merkleTree = new MerkleTree(_addresses, ethers.utils.keccak256, {
      sortPairs: true,
      hashLeaves: true,
    })
    return merkleTree.verify(_proof, ethers.utils.solidityKeccak256(['address'], [_address]), _root)
  }

  const getMerkleProof = (_addresses, _address, _index) => {
    const merkleTree = new MerkleTree(_addresses, ethers.utils.keccak256, {
      sortPairs: true,
      hashLeaves: true,
    })
    return merkleTree.getHexProof(ethers.utils.solidityKeccak256(['address'], [_address]), _index)
  }

  beforeEach(async () => {
    const GovernanceMessagePropagator = await ethers.getContractFactory(
      'GovernanceMessagePropagator'
    )
    const RegistrationManager = await ethers.getContractFactory('MockRegistrationManager')
    const LendingManager = await ethers.getContractFactory('MockLendingManager')
    const EpochsManager = await ethers.getContractFactory('EpochsManager')

    epochsManager = await EpochsManager.deploy()
    lendingManager = await LendingManager.deploy()
    registrationManager = await RegistrationManager.deploy(lendingManager.address)
    governanceMessagePropagator = await GovernanceMessagePropagator.deploy(
      epochsManager.address,
      lendingManager.address,
      registrationManager.address
    )

    signers = await ethers.getSigners()
    owner = signers[0]

    await registrationManager.setGovernanceStateReader(governanceMessagePropagator.address)

    currentEpoch = await epochsManager.currentEpoch()
  })

  it('should be able to succesfully propagate all sentinels when slashing does not happen', async () => {
    const stakingSentinels = signers.slice(0, 10).map(({ address }) => address)
    const borrowingSentinels = signers.slice(10, 20).map(({ address }) => address)

    for (let i = 0; i < stakingSentinels.length; i++) {
      await registrationManager.addStakingSentinel(
        stakingSentinels[i],
        owner.address,
        currentEpoch,
        currentEpoch + 1,
        400000
      )
    }
    for (const borrowingSentinel of borrowingSentinels) {
      await registrationManager.addBorrowingSentinel(
        borrowingSentinel,
        owner.address,
        currentEpoch,
        currentEpoch + 1
      )
    }

    const sentinels = [...stakingSentinels, ...borrowingSentinels]
    const merkleRootWithoutSlashedSentinel = getMerkleRoot(sentinels)
    const abiCoder = new ethers.utils.AbiCoder()
    const messageData = abiCoder.encode(
      ['uint16', 'uint16', 'bytes32'],
      [currentEpoch, sentinels.length, merkleRootWithoutSlashedSentinel]
    )
    const message = abiCoder.encode(
      ['bytes32', 'bytes'],
      [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('GOVERNANCE_MESSAGE_STATE_SENTINELS')),
        messageData,
      ]
    )

    await expect(governanceMessagePropagator.propagateSentinels(sentinels))
      .to.emit(governanceMessagePropagator, 'GovernanceMessage')
      .withArgs(message)
  })

  it('should be able to succesfully propagate all sentinels with more than 200k PNT', async () => {
    const stakingSentinels = signers.slice(0, 8).map(({ address }) => address)
    const slashedStakingSentinel1 = signers[8].address
    const slashedStakingSentinel2 = signers[9].address
    const borrowingSentinels = signers.slice(10, 20).map(({ address }) => address)

    for (let i = 0; i < stakingSentinels.length; i++) {
      await registrationManager.addStakingSentinel(
        stakingSentinels[i],
        owner.address,
        currentEpoch,
        currentEpoch + 1,
        400000
      )
    }

    await registrationManager.addStakingSentinel(
      slashedStakingSentinel1,
      owner.address,
      currentEpoch,
      currentEpoch + 1,
      150000
    )

    await registrationManager.addStakingSentinel(
      slashedStakingSentinel2,
      owner.address,
      currentEpoch,
      currentEpoch + 1,
      150000
    )

    for (const borrowingSentinel of borrowingSentinels) {
      await registrationManager.addBorrowingSentinel(
        borrowingSentinel,
        owner.address,
        currentEpoch,
        currentEpoch + 1
      )
    }

    const sentinels = [...stakingSentinels, ...borrowingSentinels]
    const merkleRootWithoutSlashedSentinel = getMerkleRoot(sentinels)

    const abiCoder = new ethers.utils.AbiCoder()
    const messageData = abiCoder.encode(
      ['uint16', 'uint16', 'bytes32'],
      [currentEpoch, sentinels.length, merkleRootWithoutSlashedSentinel]
    )
    const message = abiCoder.encode(
      ['bytes32', 'bytes'],
      [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('GOVERNANCE_MESSAGE_STATE_SENTINELS')),
        messageData,
      ]
    )

    // NOTE: slashedStakingSentinel1 and slashedStakingSentinel2 are needed in order to calculate the staked amount but they will not be included within the merkle root
    await expect(
      governanceMessagePropagator.propagateSentinels([
        ...stakingSentinels,
        slashedStakingSentinel1,
        slashedStakingSentinel2,
        ...borrowingSentinels,
      ])
    )
      .to.emit(governanceMessagePropagator, 'GovernanceMessage')
      .withArgs(message)
  })

  it('should be able to succesfully propagate all sentinels without the slashed one', async () => {
    const stakingSentinels = signers.slice(0, 10).map(({ address }) => address)
    const borrowingSentinels = signers.slice(10, 20).map(({ address }) => address)

    for (let i = 0; i < stakingSentinels.length; i++) {
      await registrationManager.addStakingSentinel(
        stakingSentinels[i],
        owner.address,
        currentEpoch,
        currentEpoch + 1,
        400000
      )
    }
    for (const borrowingSentinel of borrowingSentinels) {
      await registrationManager.addBorrowingSentinel(
        borrowingSentinel,
        owner.address,
        currentEpoch,
        currentEpoch + 1
      )
    }

    const sentinels = [...stakingSentinels, ...borrowingSentinels]
    const slashedSentinel = stakingSentinels[4]
    const sentinelsWithoutSlashedOne = sentinels.map(_address =>
      _address === slashedSentinel ? '0x0000000000000000000000000000000000000000' : _address
    )
    const merkleRootWithoutSlashedSentinel = getMerkleRoot(sentinelsWithoutSlashedOne)

    const abiCoder = new ethers.utils.AbiCoder()
    const messageData = abiCoder.encode(
      ['uint16', 'bytes32'],
      [currentEpoch, merkleRootWithoutSlashedSentinel]
    )
    const message = abiCoder.encode(
      ['bytes32', 'bytes'],
      [
        ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes('GOVERNANCE_MESSAGE_STATE_SENTINELS_MERKLE_ROOT')
        ),
        messageData,
      ]
    )

    // NOTE: The root generated starting from the proof + leaf = 0
    // must be equal to the root generated using address 0 in the same position where the slashed sentinel was."
    await expect(registrationManager.slash(getMerkleProof(sentinels, slashedSentinel)))
      .to.emit(governanceMessagePropagator, 'GovernanceMessage')
      .withArgs(message)

    // NOTE: At this point active sentinels should still be able to operate except the slashed one
    for (let i = 0; i < sentinels; i++) {
      expect(
        verifyMerkleProof(
          sentinelsWithoutSlashedOne,
          getMerkleProof(sentinelsWithoutSlashedOne, sentinels[i]),
          sentinels[i],
          merkleRootWithoutSlashedSentinel
        )
      ).to.be.eq(i !== 4)
    }
  })
})
