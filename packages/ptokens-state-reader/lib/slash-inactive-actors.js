const R = require('ramda')
const { utils, logic } = require('ptokens-utils')
const { logger } = require('./get-logger')
const constants = require('ptokens-constants')
const chains = require('./chains')
const { STATE_MEMORY_KEY } = require('./constants')
const { findSupportedChain } = require('./find-supported-chain')
const { setInterval } = require('timers/promises')

const slashChallenges = R.curry(
  async (Memory, _privateKey, _supportedChain, _waitingTimeAmongCalls, _challenges) => {
    const results = []
    const networkId = _supportedChain[constants.config.KEY_NETWORK_ID]
    const chainType = utils.getBlockchainTypeFromChainId(networkId)

    logger.info(`Performing slashing on '${chainType}'`)
    for (const challenge of _challenges) {
      results.push(
        await chains[chainType].slashActor(Memory, _privateKey, _supportedChain, challenge)
      )
      await logic.sleepForXMilliseconds(_waitingTimeAmongCalls)
    }
  }
)

const slashChallengesOrganizeByNetworkId = R.curry(
  (Memory, _privateKeyFile, _supportedChains, _waitingTimeAmongCalls, _challengesObj) =>
    utils
      .readIdentityFile(_privateKeyFile)
      .then(_privateKey =>
        Promise.all(
          R.keys(_challengesObj).map(_networkId =>
            Promise.resolve(findSupportedChain(_networkId)).then(_supportedChain =>
              slashChallenges(
                Memory,
                _privateKey,
                _supportedChain,
                _waitingTimeAmongCalls,
                _challengesObj[_networkId]
              )
            )
          )
        )
      )
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

module.exports.maybeSlashInactiveActors = _state =>
  new Promise((resolve, reject) => {
    const Memory = _state[STATE_MEMORY_KEY]
    const supportedChains = _state[constants.config.KEY_SUPPORTED_CHAINS]
    const privateKeyFile = _state[constants.config.KEY_IDENTITY_GPG]
    const pendingChallenges = Memory.getPendingChallenges()
    const waitingTimeAmongCalls = 1500

    logger.info(`Found ${pendingChallenges.length} pending challenges...`)

    const slashingLoop = () =>
      pendingChallenges.length > 0
        ? buildChallengesObjectByNetworkId(pendingChallenges)
            .then(
              slashChallengesOrganizeByNetworkId(
                Memory,
                privateKeyFile,
                supportedChains,
                waitingTimeAmongCalls
              )
            )
            .then(resolve)
            .then(reject)
        : logger.info('No pending challenges to process, phew!') || Promise.resolve()

    setInterval(slashingLoop, 10000) // TODO: configurable
  })
