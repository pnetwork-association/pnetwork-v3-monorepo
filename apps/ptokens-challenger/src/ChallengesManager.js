import ClientsManager from './ClientsManager.js'
import PNetworkHubABI from './abi/PNetworkHub.json' assert { type: 'json' }

class ChallengesManager {
  constructor({ challenger, db, pNetworkHubAddresses, startChallengeThresholdBlocks }) {
    this.challenger = challenger
    this.pNetworkHubAddresses = pNetworkHubAddresses
    this.startChallengeThresholdBlocks = startChallengeThresholdBlocks
    this.db = db
  }

  async getNetworksNotSyncedBySyncState({ syncState }) {
    const networkIds = Object.keys(syncState)
    const syncStateLatestBlockNumber = Object.values(syncState).map(
      ({ latestBlockNumber }) => latestBlockNumber
    )

    const clients = networkIds.map(_networkId => ClientsManager.getClientByNetworkId(_networkId))
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
    const validRequests = (
      await Promise.all(
        networks.map(
          _networkId =>
            new Promise(_resolve => {
              ClientsManager.getClientByNetworkId(_networkId)
                .simulateContract({
                  account: this.challenger,
                  address: this.pNetworkHubAddresses[_networkId],
                  abi: PNetworkHubABI,
                  functionName:
                    actorType === 'guardian' ? 'startChallengeGuardian' : 'startChallengeSentinel',
                  args: [actor, []],
                })
                .then(_resolve)
                .catch(() => _resolve(null))
            })
        )
      )
    ).filter(_request => _request)
    console.log(validRequests)
  }
}

export default ChallengesManager
