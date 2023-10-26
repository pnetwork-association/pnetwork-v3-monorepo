const R = require('ramda')
const ethers = require('ethers')
const constants = require('ptokens-constants')
const { logger } = require('./get-logger')
const {
  STATE_MEMORY_KEY,
  STATE_LOCK_AMOUNTS_KEY,
  STATE_BLOCK_TIMES_ESTIMATIONS_KEY,
  MEM_ACTOR,
  MEM_SYNC_STATE,
} = require('./constants')
const { utils, logic } = require('ptokens-utils')
const chains = require('./chains')

const KEY_ACTOR_ADDRESS = 'actorAddress'
const KEY_INACTIVE_NETWORK_IDS = 'inactiveNetworkIds'

const getLatestBlockNumbersByNetworkId = _supportedChains =>
  Promise.all(
    _supportedChains.map(_supportedChain => {
      const networkId = _supportedChain[constants.config.KEY_NETWORK_ID]
      const providerUrl = _supportedChain[constants.config.KEY_PROVIDER_URL]
      const provider = new ethers.JsonRpcProvider(providerUrl)

      return provider.getBlockNumber().then(_blockNum => ({ [networkId]: _blockNum }))
    })
  )

const buildLatestBlockNumbersObject = _latestBlockNumbersArray =>
  Promise.resolve(
    _latestBlockNumbersArray.reduce(
      (_result, _elem) => ({
        ..._result,
        ..._elem,
      }),
      {}
    )
  )

const isLastBlockNumberOverThreshold = R.curry(
  (_syncState, _blockThresholds, _latestBlockNumbersObj, _networkId) => {
    // Means the actors doesn't support that chain
    // which isn't allowed
    if (R.isNil(_syncState[_networkId])) {
      return true
    }

    const lastBlockSynced = _syncState[_networkId][constants.config.KEY_LATEST_BLOCK_NUMBER]
    const latestBlockNumber = _latestBlockNumbersObj[_networkId]
    const threshold = _blockThresholds[_networkId]
    const diff = latestBlockNumber - lastBlockSynced
    const isOverThreshold = diff > threshold
    const logSuffix = isOverThreshold ? `${diff} > ${threshold} <= challenge!` : 'fine'
    logger.debug(`  ${_networkId}: ${logSuffix}`)
    return isOverThreshold
  }
)

const getInactiveActorsAndNetworkIds = R.curry(
  (Memory, _blockThresholds, _latestBlockNumbersObj, _actorAddress) =>
    new Promise(resolve => {
      const actor = Memory.getActor(_actorAddress)
      const supportedNetworkIds = R.keys(_blockThresholds)
      let inactiveNetworkIds = []
      if (utils.isNotNil(actor)) {
        const syncState = actor[MEM_SYNC_STATE]
        logger.info(`Checking actor ${actor[MEM_ACTOR]} sync state...`)

        inactiveNetworkIds = supportedNetworkIds.filter(
          isLastBlockNumberOverThreshold(syncState, _blockThresholds, _latestBlockNumbersObj)
        )
      } else {
        // Means we've never received any state update
        // from the actor until now
        inactiveNetworkIds = supportedNetworkIds
      }

      const maybeLogSuffix =
        inactiveNetworkIds.length > 0 ? ` (${inactiveNetworkIds.join(', ')})` : ''
      return R.isNil(actor) || inactiveNetworkIds.length > 0
        ? logger.info(`Inactive actor '${_actorAddress.slice(0, 10)}...'${maybeLogSuffix}`) ||
            resolve({
              [KEY_ACTOR_ADDRESS]: _actorAddress,
              [KEY_INACTIVE_NETWORK_IDS]: inactiveNetworkIds,
            })
        : resolve(null)
    })
)

// Returns an object like:
// [{
//   "actorAddress": "0xAbcD012...",
//   "inactiveNetworkIds": [ "0x1234", "0x5678"]
// }]
const filterForInactiveActors = R.curry(
  (Memory, _actorsPropagated, _blockThresholds, _latestBlockNumbersObj) =>
    Promise.all(
      _actorsPropagated.actors.map(
        getInactiveActorsAndNetworkIds(Memory, _blockThresholds, _latestBlockNumbersObj)
      )
    ).then(utils.removeNilsFromList)
)

const startChallengeOnNetworkId = R.curry(
  (Memory, _privateKey, _supportedChains, _lockAmounts, _address, _proof, _networkId) =>
    new Promise((resolve, reject) => {
      logger.info(`Challenging actor ${_address.slice(0, 10)}... on '${_networkId}'...`)
      const chainType = R.toLower(utils.getBlockchainTypeFromChainIdSync(_networkId))
      const lockAmount = _lockAmounts[_networkId]

      return chains[chainType]
        .startChallenge(
          Memory,
          _privateKey,
          _supportedChains,
          lockAmount,
          _address,
          _proof,
          _networkId
        )
        .then(resolve)
        .catch(reject)
    })
)

const challengeActor = R.curry((Memory, _privateKey, _supportedChains, _lockAmounts, _actorElem) =>
  Promise.resolve(Memory.getActorsPropagated()).then(({ currentEpoch, actors, actorsTypes }) => {
    const actorAddress = _actorElem[KEY_ACTOR_ADDRESS]
    const proof = utils.getMerkleProofSync(currentEpoch, actors, actorsTypes, actorAddress)
    const inactiveNetworkIds = _actorElem[KEY_INACTIVE_NETWORK_IDS]
    return Promise.all(
      inactiveNetworkIds.map(
        startChallengeOnNetworkId(
          Memory,
          _privateKey,
          _supportedChains,
          _lockAmounts,
          actorAddress,
          proof
        )
      )
    )
  })
)

const challengeActors = R.curry(
  (Memory, _privateKeyFile, _supportedChains, _lockAmounts, _actorsList) =>
    utils.readIdentityFile(_privateKeyFile).then(async _privateKey => {
      logger.info(`Found ${_actorsList.length} inactive actors`)
      const results = []
      for (const actor of _actorsList) {
        results.push(
          await challengeActor(Memory, _privateKey, _supportedChains, _lockAmounts, actor)
        )
        await logic.sleepForXMilliseconds(2000)
      }
      return results
    })
)

const startChallenger = (
  Memory,
  _supportedChains,
  _actorsPropagated,
  _blockThresholds,
  _lockAmounts,
  _privateKeyFile
) =>
  getLatestBlockNumbersByNetworkId(_supportedChains)
    .then(buildLatestBlockNumbersObject)
    .then(filterForInactiveActors(Memory, _actorsPropagated, _blockThresholds))
    .then(challengeActors(Memory, _privateKeyFile, _supportedChains, _lockAmounts))

const maybeChallengeEachActor = R.curry(
  (
    Memory,
    _supportedChains,
    _actorsPropagated,
    _blockThresholds,
    _lockAmounts,
    _checkInactivityInterval,
    _privateKeyFile
  ) =>
    logger.info('Challenger started...') ||
    setInterval(
      startChallenger,
      _checkInactivityInterval * 1000,
      Memory,
      _supportedChains,
      _actorsPropagated,
      _blockThresholds,
      _lockAmounts,
      _privateKeyFile
    )
)

const getThreshold = (_blockTime, _fireChallengeThreshold) =>
  Math.floor(_fireChallengeThreshold / _blockTime)

const getThresholdsFromBlockTimes = (_blockTimes, _fireChallengeThreshold) =>
  R.keys(_blockTimes).reduce(
    (_result, _networkId) => ({
      ..._result,
      [_networkId]: getThreshold(_blockTimes[_networkId], _fireChallengeThreshold),
    }),
    {}
  )

module.exports.maybeChallengeInactiveActors = _state => {
  const supportedChains = _state[constants.config.KEY_SUPPORTED_CHAINS]
  const blockTimes = _state[STATE_BLOCK_TIMES_ESTIMATIONS_KEY]
  const lockAmounts = _state[STATE_LOCK_AMOUNTS_KEY]
  const fireChallengeThreshold = _state[constants.config.KEY_FIRE_CHALLENGE_THRESHOLD] // seconds
  const warmUpTime = _state[constants.config.KEY_WARMUP_TIME]
  const inactivityInterval = _state[constants.config.KEY_CHECK_INACTIVITY_INTERVAL]
  const privateKeyFile = _state[constants.config.KEY_IDENTITY_GPG]
  const Memory = _state[STATE_MEMORY_KEY]
  const actorsPropagated = Memory.getActorsPropagated()

  // TODO: move to index
  Memory.setDryRunTo(_state[constants.config.KEY_DRY_RUN])

  const blockThresholdsByNetworkId = getThresholdsFromBlockTimes(blockTimes, fireChallengeThreshold)

  logger.info(`Check for inactivity in ${warmUpTime} seconds...`)

  setTimeout(
    maybeChallengeEachActor,
    warmUpTime * 1000,
    Memory,
    supportedChains,
    actorsPropagated,
    blockThresholdsByNetworkId,
    lockAmounts,
    inactivityInterval,
    privateKeyFile
  )
}
