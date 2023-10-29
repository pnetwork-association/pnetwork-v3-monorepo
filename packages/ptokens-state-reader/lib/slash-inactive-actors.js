const R = require('ramda')
const { db, utils, logic } = require('ptokens-utils')
const { logger } = require('./get-logger')
const constants = require('ptokens-constants')
const chains = require('./chains')
const { STATE_DB_CHALLENGES_KEY } = require('./constants')
const { findSupportedChain } = require('./find-supported-chain')
const { setInterval } = require('timers/promises')

const slashByChallenge = R.curry(
  async (_challengesStorage, _privateKey, _supportedChains, _challengeObj, _dryRun, _networkId) => {
    const results = []
    const supportedChain = findSupportedChain(_supportedChains, _networkId)
    const chainType = utils.getBlockchainTypeFromChainId(_networkId)
    const challenges = _challengeObj[_networkId]

    logger.info(`Performing slashing on '${chainType}'`)
    for (const challenge of challenges) {
      results.push(
        await chains[chainType].slashActor(
          _challengesStorage,
          _privateKey,
          supportedChain,
          challenge,
          _dryRun
        )
      )
      await logic.sleepForXMilliseconds(1000)
    }
  }
)

const buildChallengesObjectByNetworkId = _challenges =>
  Promise.resolve(
    _challenges.reduce((_result, _challenge) => {
      const networkId = _challenge.networkId
      const elem = R.has(networkId, _result) ? _result[networkId].push(_challenge) : [_challenge]
      _result = { ..._result, [networkId]: elem }
      return _result
    }, {})
  )

const getPendingChallenges = _challengesStorage =>
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
      const dryRun = _state[constants.config.KEY_DRY_RUN]

      return buildChallengesObjectByNetworkId(_pendingChallenges).then(_challengeObj =>
        logic.mapAll(
          slashByChallenge(challengesStorage, privateKey, supportedChains, _challengeObj, dryRun),
          R.keys(_challengeObj)
        )
      )
    })

module.exports.maybeSlashInactiveActors = _state => {
  setInterval(slashingLoop, 10000)

  return Promise.resolve(_state)
}
