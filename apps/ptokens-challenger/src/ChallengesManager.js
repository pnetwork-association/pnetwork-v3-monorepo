import PNetworkHubABI from './abi/PNetworkHub.json' assert { type: 'json' }

class ChallengesManager {
  constructor({
    actorsManager,
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
    this.db = db
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
    const proof =
      actorType === 'sentinel'
        ? await this.actorsManager.getSentinelsMerkleProof({ sentinel: actor })
        : await this.actorsManager.getGuardiansMerkleProof({ guardian: actor })

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
  }
}

export default ChallengesManager
