const R = require('ramda')
const { db, utils, logic } = require('ptokens-utils')
const { logger } = require('./get-logger')
const constants = require('ptokens-constants')
const chains = require('./chains')
const { STATE_DB_CHALLENGES_KEY, STATE_CHALLENGE_DURATIONS_KEY } = require('./constants')
const { findSupportedChain } = require('./find-supported-chain')

const slashByChallenge = R.curry(
  async (
    _challengesStorage,
    _challengeDurations,
    _privateKey,
    _supportedChains,
    _challengeObj,
    _actorsToIgnore,
    _dryRun,
    _networkId
  ) => {
    const results = []
    const supportedChain = findSupportedChain(_supportedChains, _networkId)
    const chainType = utils.getBlockchainTypeFromChainIdSync(_networkId)
    const challenges = _challengeObj[_networkId]

    logger.info(`Performing slashing on '${chainType}'`)

    for (const challenge of challenges) {
      const now = new Date()
      const challengeDuration = _challengeDurations[challenge.networkId]
      const expiration = new Date(challenge.timestamp * 1000 + challengeDuration)
      if (_actorsToIgnore.includes(challenge.actor)) {
        logger.info(`Slashing for actor ${challenge.actor} skipped...`)
        continue
      }

      if (now > expiration) {
        results.push(
          await chains[R.toLower(chainType)].slashActor(
            _challengesStorage,
            _privateKey,
            supportedChain,
            challenge,
            _dryRun
          )
        )
      } else {
        logger.info(`Skipping slashing, not the time yet ${now} < ${expiration}`)
      }

      await logic.sleepForXMilliseconds(1000)
    }
  }
)

const buildChallengesObjectByNetworkId = _challenges =>
  Promise.resolve(
    _challenges.reduce((_result, _challenge) => {
      const networkId = _challenge.networkId
      const elem = R.has(networkId, _result) ? _result[networkId].concat(_challenge) : [_challenge]
      _result = { ..._result, [networkId]: elem }
      return _result
    }, {})
  )

const getPendingChallenges = _challengesStorage =>
  logger.debug('Checking for new pending challenges') ||
  db.findReports(
    _challengesStorage,
    {
      [constants.db.KEY_STATUS]: constants.hub.challengeStatus.PENDING,
    },
    {}
  )

const slashingLoop = _state =>
  Promise.resolve(_state[STATE_DB_CHALLENGES_KEY])
    .then(getPendingChallenges)
    .then(_pendingChallenges => {
      logger.info(`Found ${_pendingChallenges.length} pending challenges...`)
      const challengesStorage = _state[STATE_DB_CHALLENGES_KEY]
      const privateKeyFile = _state[constants.config.KEY_IDENTITY_GPG]
      const privateKey = utils.readIdentityFileSync(privateKeyFile)
      const supportedChains = _state[constants.config.KEY_SUPPORTED_CHAINS]
      const actorsToIgnore = _state[constants.config.KEY_IGNORE_ACTORS]
      const dryRun = _state[constants.config.KEY_DRY_RUN]
      const challengeDurations = _state[STATE_CHALLENGE_DURATIONS_KEY]

      return buildChallengesObjectByNetworkId(_pendingChallenges).then(_challengeObj =>
        logic.mapAll(
          slashByChallenge(
            challengesStorage,
            challengeDurations,
            privateKey,
            supportedChains,
            _challengeObj,
            actorsToIgnore,
            dryRun
          ),
          R.keys(_challengeObj)
        )
      )
    })

module.exports.maybeSlashInactiveActors = _state => {
  logger.info('Starting slashing loop in 10s...')
  setInterval(slashingLoop, 10000, _state)
}
