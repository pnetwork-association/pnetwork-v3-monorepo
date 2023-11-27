const R = require('ramda')
const ethers = require('ethers')
const constants = require('ptokens-constants')
const { logger } = require('./get-logger')
const {
  STATE_LOCK_AMOUNTS_KEY,
  MEM_ACTOR,
  MEM_SYNC_STATE,
  STATE_DB_ACTORS_KEY,
  STATE_DB_ACTORS_PROPAGATED_KEY,
  STATE_DB_CHALLENGES_KEY,
  STATE_BLOCK_THRESHOLDS_KEY,
  ID_ACTORS_PROPAGATED,
  STATE_PROOFS_KEY,
} = require('./constants')
const { db, utils, logic } = require('ptokens-utils')
const chains = require('./chains')
const { findSupportedChain } = require('./find-supported-chain')
const { getActorFromStorage } = require('./get-actor-from-storage')

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
      logger.info(`  ${_networkId}: not defined`)
      return true
    }

    const lastBlockSynced = _syncState[_networkId][constants.statusObject.KEY_LATEST_BLOCK_NUMBER]
    const latestBlockNumber = _latestBlockNumbersObj[_networkId]
    const threshold = _blockThresholds[_networkId]
    const diff = latestBlockNumber - lastBlockSynced
    const isOverThreshold = diff > threshold
    const logSuffix = isOverThreshold ? `${diff} > ${threshold} <= challenge!` : 'fine'
    logger.info(`  ${_networkId}: ${logSuffix}`)
    return isOverThreshold
  }
)

const getInactiveActorsAndNetworkIds = R.curry(
  (_actorsStorage, _blockThresholds, _latestBlockNumbersObj, _actorAddress) =>
    getActorFromStorage(_actorsStorage, _actorAddress).then(_actor => {
      // Gently reminder
      // _blockThresholds = { '0x1234': 500, '0x4566': 6000 }
      const supportedNetworkIds = R.keys(_blockThresholds)
      const actorSyncState = R.prop(MEM_SYNC_STATE, _actor)
      let inactiveNetworkIds = []
      if (utils.isNotNil(actorSyncState)) {
        logger.info(`Checking actor ${_actor[MEM_ACTOR]} sync state...`)

        inactiveNetworkIds = supportedNetworkIds.filter(
          isLastBlockNumberOverThreshold(actorSyncState, _blockThresholds, _latestBlockNumbersObj)
        )
      } else {
        // Means we've never received any state update
        // from the _actor until now
        inactiveNetworkIds = supportedNetworkIds
      }

      const maybeLogSuffix =
        inactiveNetworkIds.length > 0 ? ` (${inactiveNetworkIds.join(', ')})` : ''
      return R.isNil(_actor) || inactiveNetworkIds.length > 0
        ? logger.info(`Inactive actor '${_actorAddress.slice(0, 10)}...'${maybeLogSuffix}`) ||
            Promise.resolve({
              [KEY_ACTOR_ADDRESS]: R.toLower(_actorAddress),
              [KEY_INACTIVE_NETWORK_IDS]: inactiveNetworkIds,
            })
        : Promise.resolve(null)
    })
)

// Returns an object like:
// [{
//   "actorAddress": "0xAbcD012...",
//   "inactiveNetworkIds": [ "0x1234", "0x5678"]
// }]
const filterForInactiveActors = R.curry(
  (_actorsStorage, _actorsPropagatedStorage, _blockThresholds, _latestBlockNumbersObj) =>
    db
      .findReportById(_actorsPropagatedStorage, ID_ACTORS_PROPAGATED)
      .then(R.prop('actors'))
      .then(
        logic.mapAll(
          getInactiveActorsAndNetworkIds(_actorsStorage, _blockThresholds, _latestBlockNumbersObj)
        )
      )
      .then(utils.removeNilsFromList)
)

const startChallengeOnNetworkId = R.curry(
  (
    _actorsStorage,
    _challengesStorage,
    _supportedChains,
    _privateKey,
    _lockAmounts,
    _dryRun,
    _actorAddress,
    _actorType,
    _proof,
    _networkId
  ) =>
    new Promise((resolve, reject) => {
      const lockAmount = _lockAmounts[_networkId]
      const chainType = utils.getBlockchainTypeFromChainIdSync(_networkId)
      const supportedChain = findSupportedChain(_supportedChains, _networkId)

      return chains[R.toLower(chainType)]
        .startChallenge(
          _actorsStorage,
          _challengesStorage,
          supportedChain,
          _privateKey,
          lockAmount,
          _actorAddress,
          _actorType,
          _proof,
          _networkId,
          _dryRun
        )
        .then(resolve)
        .catch(reject)
    })
)

const challengeActor = R.curry(
  (
    _actorsStorage,
    _challengesStorage,
    _actorsPropagatedStorage,
    _proofsByActor,
    _privateKey,
    _supportedChains,
    _lockAmounts,
    _dryRun,
    _actorElem
  ) =>
    db
      .findReportById(_actorsPropagatedStorage, ID_ACTORS_PROPAGATED)
      .then(({ actors, actorsTypes }) => {
        const actorAddress = _actorElem[KEY_ACTOR_ADDRESS]
        const actorType = actorsTypes[actors.indexOf(actorAddress)]
        const proof = _proofsByActor[actorAddress]
        const inactiveNetworkIds = _actorElem[KEY_INACTIVE_NETWORK_IDS]

        logger.info(`Challenging actor '${actorAddress}' (${actorType})`)

        return logic.mapAll(
          startChallengeOnNetworkId(
            _actorsStorage,
            _challengesStorage,
            _supportedChains,
            _privateKey,
            _lockAmounts,
            _dryRun,
            actorAddress,
            actorType,
            proof
          ),
          inactiveNetworkIds
        )
      })
)

const challengeActors = R.curry(
  (
    _actorsStorage,
    _challengesStorage,
    _actorsPropagatedStorage,
    _proofsByActor,
    _privateKeyFile,
    _supportedChains,
    _lockAmounts,
    _actorsToIgnore,
    _dryRun,
    _actorsList
  ) =>
    utils.readIdentityFile(_privateKeyFile).then(async _privateKey => {
      logger.info(`Found ${_actorsList.length} inactive actors`)
      const results = []
      for (const actor of _actorsList) {
        const address = actor[KEY_ACTOR_ADDRESS]
        if (_actorsToIgnore.includes(address)) {
          logger.info(`'${address.slice(0, 10)}...' belongs to ignored actors, skipping...`)
          continue
        }

        results.push(
          await challengeActor(
            _actorsStorage,
            _challengesStorage,
            _actorsPropagatedStorage,
            _proofsByActor,
            _privateKey,
            _supportedChains,
            _lockAmounts,
            _dryRun,
            actor
          )
        )
        await logic.sleepForXMilliseconds(10000)
      }
      return results
    })
)

const startChallenger = _state =>
  new Promise((resolve, reject) => {
    const actorsStorage = _state[STATE_DB_ACTORS_KEY]
    const challengesStorage = _state[STATE_DB_CHALLENGES_KEY]
    const actorsPropagatedStorage = _state[STATE_DB_ACTORS_PROPAGATED_KEY]
    const privateKeyFile = _state[constants.config.KEY_IDENTITY_GPG]
    const lockAmounts = _state[STATE_LOCK_AMOUNTS_KEY]
    const blockThresholds = _state[STATE_BLOCK_THRESHOLDS_KEY]
    const supportedChains = _state[constants.config.KEY_SUPPORTED_CHAINS]
    const proofsByActor = _state[STATE_PROOFS_KEY]
    const actorsToIgnore = _state[constants.config.KEY_IGNORE_ACTORS]
    const dryRun = _state[constants.config.KEY_DRY_RUN]

    return getLatestBlockNumbersByNetworkId(supportedChains)
      .then(buildLatestBlockNumbersObject)
      .then(filterForInactiveActors(actorsStorage, actorsPropagatedStorage, blockThresholds))
      .then(
        challengeActors(
          actorsStorage,
          challengesStorage,
          actorsPropagatedStorage,
          proofsByActor,
          privateKeyFile,
          supportedChains,
          lockAmounts,
          actorsToIgnore,
          dryRun
        )
      )
      .then(resolve)
      .then(reject)
  })

const maybeChallengeEachActor = _state =>
  new Promise((resolve, _) => {
    const inactivityCheckInterval = _state[constants.config.KEY_CHECK_INACTIVITY_INTERVAL]
    logger.info('Challenger started...')
    startChallenger(_state)
    setInterval(startChallenger, inactivityCheckInterval * 1000, _state)
    return resolve()
  })

module.exports.maybeChallengeInactiveActors = _state => {
  const warmUpTime = _state[constants.config.KEY_WARMUP_TIME]

  logger.info(`Check for inactivity in ${warmUpTime} seconds...`)

  setTimeout(maybeChallengeEachActor, warmUpTime * 1000, _state)
}
