import { getContract, keccak256, encodePacked, parseAbiItem } from 'viem'
import { MerkleTree } from 'merkletreejs'
import { Mutex } from 'async-mutex'

import EpochsManagerABI from './abi/EpochsManager.json' assert { type: 'json' }
import GovernanceMessageEmitterABI from './abi/GovernanceMessageEmitter.json' assert { type: 'json' }
import RegistrationManagerABI from './abi/RegistrationManager.json' assert { type: 'json' }

const sleep = _ms => new Promise(_resolve => setTimeout(() => _resolve(), _ms))

class ActorsManager {
  constructor({
    client,
    db,
    epochsManagerAddress,
    governanceMessageEmitterAddress,
    logger,
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
    this.logger = logger

    this.actors = db.collection('actors')
    this.lastMessageTimestamps = db.collection('lastMessageTimestamps')
    this.mutex = new Mutex()

    this.init()
  }

  async init() {
    this.logger.info('✓ Initializing actors ...')
    const promises = []
    const currentEpoch = await this.epochsManager.read.currentEpoch()
    const [guardians, sentinels] = await Promise.all([
      this.actors.find({ epoch: currentEpoch, actorType: 'guardian' }).toArray(),
      this.actors.find({ epoch: currentEpoch, actorType: 'sentinel' }).toArray(),
    ])

    if (guardians.length === 0) {
      this.logger.info('✓ Storing guardians ...')
      promises.push(this.storeActorsForEpoch({ actorType: 'guardian', epoch: currentEpoch }))
    }
    if (sentinels.length === 0) {
      this.logger.info('✓ Storing sentinels ...')
      promises.push(this.storeActorsForEpoch({ actorType: 'sentinel', epoch: currentEpoch }))
    }

    const release = await this.mutex.acquire()
    await Promise.all(promises)
    this.logger.info('✓ Actors initialization completed!')
    await release()
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

  async getActorsInCurrentEpoch() {
    const currentEpoch = await this.epochsManager.read.currentEpoch()
    return this.actors.find({ epoch: currentEpoch }).toArray()
  }

  async getActorsMerkleProofForCurrentEpoch({ actor, actorType }) {
    const tree = await this.getActorsMerkleTreeForCurrentEpoch({ actorType })
    return tree.getHexProof(keccak256(encodePacked(['address'], [actor])))
  }

  async getActorsMerkleTreeForCurrentEpoch({ actorType }) {
    const currentEpoch = await this.epochsManager.read.currentEpoch()

    if (this.mutex.isLocked()) {
      this.logger.info('✓ Waiting mutex to be released ...')
    }
    const actors = await this.mutex.runExclusive(async () =>
      (
        await this.actors.find({ epoch: currentEpoch, actorType }).toArray()
      ).map(({ address }) => address)
    )

    // TODO: Address vulnerability where an attacker could reorder sentinels/guardians, compromising our stored list.
    // Consider implementing a function to refetch and store the latest events if the transaction fails.

    if (actors.length === 0) {
      throw new Error(
        `${
          actorType === 'sentinel' ? 'SentinelsPropagated' : 'GuardiansPropagated'
        } not emitted yet in the current epoch`
      )
    }

    const leaves = actors.map(_address => keccak256(encodePacked(['address'], [_address])))
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
    return tree
  }

  getLastMessageTimestampByActorAndNetwork({ actor, network }) {
    return this.lastMessageTimestamps.findOne({ actor, network })
  }

  async setActorLastMessageTimestamp({ actor, network, timestamp }) {
    await this.lastMessageTimestamps.insertOne({
      actor,
      timestamp,
      network,
    })
  }

  async storeActorsForEpoch({ actorType, epoch }) {
    const latestBlockNumber = await this.client.getBlockNumber()

    let actors = []
    let logs = []
    let fromBlock = latestBlockNumber - 9999n
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
          epoch,
        },
        fromBlock,
        toBlock,
      })

      if (logs.length > 0) {
        // NOTE: if within the current epoch no SentinelsPropagated events have been emitted yet
        if (logs[0].args.epoch < epoch) {
          logs = []
        }
        break
      }

      toBlock = fromBlock - 1n
      fromBlock = fromBlock - 9999n
      await sleep(200) // avoid to exceed rpc rate limit
    }

    actors =
      logs.length > 0
        ? actorType === 'sentinel'
          ? logs[0].args.sentinels
          : logs[0].args.guardians
        : []

    if (actors.length > 0) {
      this.logger.info(
        `✓ Detected ${actorType}s propagation in epoch ${epoch}. Storing in the db ...`
      )
      await this.actors.insertMany(
        actors.map(_address => ({
          actorType,
          address: _address,
          epoch,
        }))
      )
    }

    return actors
  }
}

export default ActorsManager
