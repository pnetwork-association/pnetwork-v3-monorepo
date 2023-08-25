const { expect } = require('chai')
const { ethers } = require('hardhat')
const { MerkleTree } = require('merkletreejs')

let governanceStateReader,
  epochsManager,
  lendingManager,
  registrationManager,
  signers,
  currentEpoch,
  owner

describe('GovernanceStateReader', () => {
  const getMerkleRoot = _addresses => {
    const leaves = _addresses.map(_address =>
      ethers.utils.solidityKeccak256(['address'], [_address])
    )
    const merkleTree = new MerkleTree(leaves, ethers.utils.keccak256, { sortPairs: true })
    return merkleTree.getHexRoot()
  }

  beforeEach(async () => {
    const GovernanceStateReader = await ethers.getContractFactory('GovernanceStateReader')
    const RegistrationManager = await ethers.getContractFactory('MockRegistrationManager')
    const LendingManager = await ethers.getContractFactory('MockLendingManager')
    const EpochsManager = await ethers.getContractFactory('EpochsManager')

    epochsManager = await EpochsManager.deploy()
    lendingManager = await LendingManager.deploy()
    registrationManager = await RegistrationManager.deploy(lendingManager.address)
    governanceStateReader = await GovernanceStateReader.deploy(
      epochsManager.address,
      lendingManager.address,
      registrationManager.address
    )

    signers = await ethers.getSigners()
    owner = signers[0]

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
    const expectedRoot = getMerkleRoot(sentinels)
    const abiCoder = new ethers.utils.AbiCoder()
    const messageData = abiCoder.encode(
      ['uint16', 'uint16', 'bytes32'],
      [currentEpoch, sentinels.length, expectedRoot]
    )
    const message = abiCoder.encode(
      ['bytes32', 'bytes'],
      [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('GOVERNANCE_MESSAGE_STATE_SENTINELS')),
        messageData,
      ]
    )

    await expect(governanceStateReader.propagateSentinels(sentinels))
      .to.emit(governanceStateReader, 'GovernanceMessage')
      .withArgs(message)
  })

  it('should be able to succesfully propagate all sentinels that more than 200k PNT', async () => {
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

      await registrationManager.addStakingSentinel(
        slashedStakingSentinel1,
        owner.address,
        currentEpoch,
        currentEpoch + 1,
        150000
      )
    }

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
    const expectedRoot = getMerkleRoot(sentinels)

    const abiCoder = new ethers.utils.AbiCoder()
    const messageData = abiCoder.encode(
      ['uint16', 'uint16', 'bytes32'],
      [currentEpoch, sentinels.length, expectedRoot]
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
      governanceStateReader.propagateSentinels([
        ...stakingSentinels,
        slashedStakingSentinel1,
        slashedStakingSentinel2,
        ...borrowingSentinels,
      ])
    )
      .to.emit(governanceStateReader, 'GovernanceMessage')
      .withArgs(message)
  })
})
