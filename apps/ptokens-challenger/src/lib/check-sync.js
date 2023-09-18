import ClientsManager from '../ClientsManager.js'
import settings from '../settings/index.js'

const getNetworksNotInSyncBySyncState = async ({ syncState }) => {
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
      settings.startChallengeThresholdBlocks[_networkId]
  )
}

export { getNetworksNotInSyncBySyncState }
