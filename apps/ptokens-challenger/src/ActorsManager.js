import { getContract, keccak256, encodePacked } from 'viem'
import { MerkleTree } from 'merkletreejs'

import EpochsManagerABI from './abi/EpochsManager.json' assert { type: 'json' }
import GovernanceMessageEmitterABI from './abi/GovernanceMessageEmitter.json' assert { type: 'json' }
import RegistrationManagerABI from './abi/RegistrationManager.json' assert { type: 'json' }

class ActorsManager {
  constructor({
    client,
    epochsManagerAddress,
    governanceMessageEmitterAddress,
    registrationManagerAddress,
  }) {
    this.registrationManager = getContract({
      address: registrationManagerAddress,
      abi: RegistrationManagerABI,
      publicClient: client,
    })

    this.epochsManager = getContract({
      address: epochsManagerAddress,
      abi: EpochsManagerABI,
      publicClient: client,
    })

    this.governanceMessageEmitter = getContract({
      address: governanceMessageEmitterAddress,
      abi: GovernanceMessageEmitterABI,
      publicClient: client,
    })

    this.client = client
  }

  async isActor({ actor, actorType }) {
    const currentEpoch = await this.epochsManager.read.currentEpoch()

    if (actorType === 'guardian') {
      const registration = await this.registrationManager.read.guardianRegistration([actor])
      if (currentEpoch >= registration.startEpoch && currentEpoch <= registration.endEpoch)
        return true
    }

    if (actorType === 'sentinel') {
      const registration = await this.registrationManager.read.sentinelRegistration([actor])
      if (currentEpoch >= registration.startEpoch && currentEpoch <= registration.endEpoch)
        return true
    }

    return false
  }

  async getSentinelsMerkleProof({ sentinel }) {
    const tree = await this.getSentinelsMerkleTreeForCurrentEpoch()
    return tree.getHexProof(keccak256(encodePacked(['address'], [sentinel])))
  }

  async getSentinelsMerkleTreeForCurrentEpoch() {
    const currentEpoch = await this.epochsManager.read.currentEpoch()
    const logs = await this.client.getFilterLogs({
      filter: await this.client.createContractEventFilter({
        abi: this.governanceMessageEmitter.abi,
        address: this.governanceMessageEmitter.address,
        eventName: 'SentinelsPropagated',
        args: {
          epoch: currentEpoch,
        },
      }),
    })

    console.log(logs)
    const sentinels = []
    const leaves = sentinels.map(_address => keccak256(encodePacked(['address'], [_address])))
    const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true })
    return merkleTree
  }
}

export default ActorsManager
