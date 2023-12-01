const { expect } = require('chai')
const { ethers } = require('hardhat')
const constants = require('ptokens-constants')
const { SLASHING_QUANTITY } = require('./constants')
const { MerkleTree } = require('merkletreejs')
const { time } = require('@nomicfoundation/hardhat-network-helpers')

let governanceMessageEmitter,
  epochsManager,
  lendingManager,
  registrationManager,
  signers,
  currentEpoch,
  challenger,
  registry,
  dao,
  owner,
  fakeDandelionVoting

describe('GovernanceMessageEmitter', () => {
  const getMerkleRoot = (_addresses, _types) => {
    const leaves = _addresses.map((_address, _index) =>
      ethers.utils.solidityKeccak256(['address', 'uint8'], [_address, _types[_index]])
    )

    const merkleTree = new MerkleTree(leaves, ethers.utils.keccak256, {
      sortPairs: true,
    })
    return merkleTree.getHexRoot()
  }

  const verifyMerkleProof = (_addresses, _types, _proof, _address, _type, _root) => {
    const leaves = _addresses.map((_address, _index) =>
      ethers.utils.solidityKeccak256(['address', 'uint8'], [_address, _types[_index]])
    )

    const merkleTree = new MerkleTree(leaves, ethers.utils.keccak256, {
      sortPairs: true,
    })
    return merkleTree.verify(
      _proof,
      ethers.utils.solidityKeccak256(['address', 'uint8'], [_address, _type]),
      _root
    )
  }

  const getMerkleProof = (_addresses, _types, _address, _type, _index) => {
    const leaves = _addresses.map((_address, _index) =>
      ethers.utils.solidityKeccak256(['address', 'uint8'], [_address, _types[_index]])
    )

    const merkleTree = new MerkleTree(leaves, ethers.utils.keccak256, {
      sortPairs: true,
    })
    return merkleTree.getHexProof(
      ethers.utils.solidityKeccak256(['address', 'uint8'], [_address, _type]),
      _index
    )
  }

  beforeEach(async () => {
    signers = await ethers.getSigners()
    owner = signers[0]
    challenger = signers[1]
    dao = signers[2]
    fakeDandelionVoting = signers[3]

    const GovernanceMessageEmitter = await ethers.getContractFactory('GovernanceMessageEmitter')
    const RegistrationManager = await ethers.getContractFactory('MockRegistrationManager')
    const LendingManager = await ethers.getContractFactory('MockLendingManager')
    const EpochsManager = await ethers.getContractFactory('EpochsManager')
    const PRegistry = await ethers.getContractFactory('PRegistry')

    epochsManager = await EpochsManager.deploy()
    lendingManager = await LendingManager.deploy()
    registry = await PRegistry.deploy(dao.address)
    registrationManager = await RegistrationManager.deploy(lendingManager.address)
    governanceMessageEmitter = await GovernanceMessageEmitter.deploy(
      epochsManager.address,
      lendingManager.address,
      registrationManager.address,
      fakeDandelionVoting.address,
      registry.address
    )

    await registrationManager.setGovernanceMessageEmitter(governanceMessageEmitter.address)

    currentEpoch = await epochsManager.currentEpoch()
  })

  it('should be able to succesfully propagate all sentinels when slashing does not happen', async () => {
    const stakingSentinels = signers.slice(0, 5).map(({ address }) => address)
    const borrowingSentinels = signers.slice(5, 10).map(({ address }) => address)
    const guardians = signers.slice(10, 20).map(({ address }) => address)

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

    const actors = [...guardians, ...stakingSentinels, ...borrowingSentinels]
    const sentinels = [...stakingSentinels, ...borrowingSentinels]
    const types = [
      ...guardians.map(() => constants.hub.actors.Guardian),
      ...sentinels.map(() => constants.hub.actors.Sentinel),
    ]
    const merkleRootWithoutSlashedSentinel = getMerkleRoot(actors, types)
    const abiCoder = new ethers.utils.AbiCoder()

    const message = abiCoder.encode(
      ['uint256', 'uint32[]', 'address[]', 'bytes'],
      [
        0,
        [],
        [],
        abiCoder.encode(
          ['bytes32', 'bytes'],
          [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('GOVERNANCE_MESSAGE_ACTORS')),
            abiCoder.encode(
              ['uint16', 'uint16', 'uint16', 'bytes32'],
              [currentEpoch, guardians.length, sentinels.length, merkleRootWithoutSlashedSentinel]
            ),
          ]
        ),
      ]
    )

    await expect(
      governanceMessageEmitter.propagateActors(guardians, [
        ...stakingSentinels,
        ...borrowingSentinels,
      ])
    )
      .to.emit(governanceMessageEmitter, 'GovernanceMessage')
      .withArgs(message)
  })

  it('should be able to succesfully propagate all sentinels with more than 200k PNT', async () => {
    const stakingSentinels = signers.slice(0, 8).map(({ address }) => address)
    const slashedStakingSentinel1 = signers[8].address
    const slashedStakingSentinel2 = signers[9].address
    const borrowingSentinels = signers.slice(10, 15).map(({ address }) => address)
    const guardians = signers.slice(15, 20).map(({ address }) => address)

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

    const actors = [...guardians, ...stakingSentinels, ...borrowingSentinels] // slashedStakingSentinel1 and slashedStakingSentinel2 are filtered
    const sentinels = [...stakingSentinels, ...borrowingSentinels]
    const types = [
      ...guardians.map(() => constants.hub.actors.Guardian),
      ...sentinels.map(() => constants.hub.actors.Sentinel),
    ]
    const merkleRootWithoutSlashedSentinel = getMerkleRoot(actors, types)

    const abiCoder = new ethers.utils.AbiCoder()
    const message = abiCoder.encode(
      ['uint256', 'uint32[]', 'address[]', 'bytes'],
      [
        0,
        [],
        [],
        abiCoder.encode(
          ['bytes32', 'bytes'],
          [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('GOVERNANCE_MESSAGE_ACTORS')),
            abiCoder.encode(
              ['uint16', 'uint16', 'uint16', 'bytes32'],
              [currentEpoch, guardians.length, sentinels.length, merkleRootWithoutSlashedSentinel]
            ),
          ]
        ),
      ]
    )

    // NOTE: slashedStakingSentinel1 and slashedStakingSentinel2 are needed in order to calculate the staked amount but they will be filtered in the merkle tree
    await expect(
      governanceMessageEmitter.propagateActors(guardians, [
        ...stakingSentinels,
        slashedStakingSentinel1,
        slashedStakingSentinel2,
        ...borrowingSentinels,
      ])
    )
      .to.emit(governanceMessageEmitter, 'GovernanceMessage')
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
    const types = sentinels.map(() => constants.hub.actors.Sentinel)

    const merkleRootWithoutSlashedSentinel = getMerkleRoot(sentinelsWithoutSlashedOne, types)

    const abiCoder = new ethers.utils.AbiCoder()
    const message = abiCoder.encode(
      ['uint256', 'uint32[]', 'address[]', 'bytes'],
      [
        0,
        [],
        [],
        abiCoder.encode(
          ['bytes32', 'bytes'],
          [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('GOVERNANCE_MESSAGE_SLASH_ACTOR')),
            abiCoder.encode(
              ['uint16', 'address', 'uint8'],
              [currentEpoch, slashedSentinel, constants.hub.actors.Sentinel]
            ),
          ]
        ),
      ]
    )

    await expect(
      registrationManager.slash(
        slashedSentinel,
        SLASHING_QUANTITY,
        challenger.address,
        await time.latest()
      )
    )
      .to.emit(governanceMessageEmitter, 'GovernanceMessage')
      .withArgs(message)

    // NOTE: At this point active sentinels should still be able to operate except the slashed one
    for (let i = 0; i < sentinels; i++) {
      expect(
        verifyMerkleProof(
          sentinelsWithoutSlashedOne,
          getMerkleProof(
            sentinelsWithoutSlashedOne,
            types,
            sentinels[i],
            constants.hub.actors.Sentinel
          ),
          sentinels[i],
          merkleRootWithoutSlashedSentinel
        )
      ).to.be.eq(i !== 4)
    }
  })
})
