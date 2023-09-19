import { getContract, keccak256, encodePacked, parseAbiItem } from 'viem'
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

  async getActorsMerkleProofForCurrentEpoch({ actor, actorType }) {
    const tree = await this.getActorsMerkleTreeForCurrentEpoch({ actorType })
    return tree.getHexProof(keccak256(encodePacked(['address'], [actor])))
  }

  async getActorsMerkleTreeForCurrentEpoch({ actorType }) {
    const currentEpoch = await this.epochsManager.read.currentEpoch()
    const latestBlockNumber = await this.client.getBlockNumber()

    let logs = []
    let fromBlock = latestBlockNumber - 5000n
    let toBlock = latestBlockNumber

    // eslint-disable-next-line no-constant-condition
    while (true) {
      logs = await this.client.getLogs({
        address: this.governanceMessageEmitter.address,
        event:
          actorType === 'sentinel'
            ? parseAbiItem('event SentinelsPropagated(uint16 indexed epoch, address[] sentinels)')
            : parseAbiItem('event GuardiansPropagated(uint16 indexed epoch, address[] guardians)'),
        args: {
          epoch: currentEpoch,
        },
        fromBlock,
        toBlock,
      })

      if (logs.length > 0) {
        // NOTE: if within the current epoch no SentinelsPropagated events have been emitted yet
        if (logs[0].args.epoch < currentEpoch) {
          logs = []
        }
        break
      }

      toBlock = fromBlock - 1n
      fromBlock = fromBlock - 5000n
    }

    if (logs.length === 0) {
      throw new Error('SentinelsPropagated not emitted yet in the current epoch')
    }

    const actors =
      logs.length > 0
        ? actorType === 'sentinel'
          ? logs[0].args.sentinels
          : logs[0].args.guardians
        : []
    const leaves = actors.map(_address => keccak256(encodePacked(['address'], [_address])))
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
    return tree
  }
}

export default ActorsManager
