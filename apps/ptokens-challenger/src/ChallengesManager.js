import { ObjectId } from 'mongodb'
import moment from 'moment'

import PNetworkHubABI from './abi/PNetworkHub.json' assert { type: 'json' }

class ChallengesManager {
  constructor({
    actorsManager,
    challengeDuration,
    challengerAddress,
    clientsManager,
    db,
    pNetworkHubAddresses,
    startChallengeThresholdBlocks,
  }) {
    this.actorsManager = actorsManager
    this.challengerAddress = challengerAddress
    this.pNetworkHubAddresses = pNetworkHubAddresses
    this.startChallengeThresholdBlocks = startChallengeThresholdBlocks
    this.clientsManager = clientsManager
    this.challengeDuration = challengeDuration

    this.challenges = db.collection('challenges')

    this.processPendingChallenges()
    setInterval(() => {
      this.processPendingChallenges()
    }, 20000)
  }

  async processPendingChallenges() {
    try {
      console.log('✓ Checking pending challenges ...')
      const pendingChallenges = await this.challenges
        .find({
          status: 'pending',
          timestamp: { $lt: moment().unix() - this.challengeDuration },
        })
        .toArray()

      if (pendingChallenges.length === 0) {
        console.log('✓ No pending challenges found! Skipping ...')
        return
      }

      // TODO: solve challenge

      console.log(
        `✓ Found ${pendingChallenges.length} solvable challenge${
          pendingChallenges.length > 1 ? 's' : ''
        }! Setting as solved ...`
      )
      this.challenges.updateMany(
        { _id: { $in: pendingChallenges.map(({ _id }) => new ObjectId(_id)) } },
        { $set: { status: 'solved' } }
      )
    } catch (_err) {
      console.error(_err)
    }
  }

  async getNetworksNotSyncedBySyncState({ syncState }) {
    const networkIds = Object.keys(syncState)
    const syncStateLatestBlockNumber = Object.values(syncState).map(
      ({ latestBlockNumber }) => latestBlockNumber
    )

    const clients = networkIds.map(_networkId =>
      this.clientsManager.getClientByNetworkId(_networkId)
    )
    const fetchedLatestBlockNumbers = await Promise.all(
      clients.map(_client => _client.getBlockNumber())
    )

    // TODO: improve checks

    return networkIds.filter(
      (_networkId, _index) =>
        Number(fetchedLatestBlockNumbers[_index]) - syncStateLatestBlockNumber[_index] >
        this.startChallengeThresholdBlocks[_networkId]
    )
  }

  async startChallengesByNetworks({ actor, actorType, networks }) {
    const proof = await this.actorsManager.getActorsMerkleProofForCurrentEpoch({ actor, actorType })
    const validRequests = (
      await Promise.all(
        networks.map(
          _networkId =>
            new Promise(_resolve => {
              this.clientsManager
                .getClientByNetworkId(_networkId)
                .simulateContract({
                  account: this.challengerAddress,
                  address: this.pNetworkHubAddresses[_networkId],
                  abi: PNetworkHubABI,
                  functionName:
                    actorType === 'guardian' ? 'startChallengeGuardian' : 'startChallengeSentinel',
                  args: [actor, [proof]],
                })
                .then(_resolve)
                .catch(() => _resolve(null))
            })
        )
      )
    ).filter(_request => _request)
    console.log(validRequests)

    // TODO: start challenge + store challenge within mongo
    /*await this.challenges.insertOne({
      status: 'pending',
      test: 'test',
      timestamp: moment().unix(),
    })*/
  }
}

export default ChallengesManager
