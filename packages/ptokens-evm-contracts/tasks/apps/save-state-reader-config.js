const R = require('ramda')
const path = require('path')
const constants = require('ptokens-constants')
const { maybeSaveConfiguration } = require('./save-configuration')
const { addSupportedChains } = require('./add-supported-chains')
const { addProtocols } = require('./add-protocols')
const { addIdentity } = require('./add-identity')
const { getMongoUrlFromTaskArgs } = require('./get-mongo-url')
const { FLAG_MONGO_LOCALHOST } = require('../constants')

const PATH_TO_CHALLENGER_APP = path.join(__dirname, '../../../../apps/ptokens-challenger')

const addDb = R.curry((_taskArgs, _obj) =>
  Promise.resolve({
    ..._obj,
    [constants.config.KEY_DB]: {
      [constants.config.KEY_NAME]: 'challenger',
      [constants.config.KEY_TABLE_EVENTS]: 'toremove',
      [constants.config.KEY_URL]: getMongoUrlFromTaskArgs({ [FLAG_MONGO_LOCALHOST]: true }),
    },
  })
)

const addWarmUpTime = _obj =>
  Promise.resolve({
    ..._obj,
    [constants.config.KEY_WARMUP_TIME]: 60,
  })

const addFireChallengeThreshold = _obj =>
  Promise.resolve({
    ..._obj,
    [constants.config.KEY_FIRE_CHALLENGE_THRESHOLD]: 5 * 60, // 5 min
  })

const addCheckInactivityInterval = _obj =>
  Promise.resolve({
    ..._obj,
    [constants.config.KEY_CHECK_INACTIVITY_INTERVAL]: 30,
  })

const addIgnoredActors = _obj =>
  Promise.resolve({
    ..._obj,
    [constants.config.KEY_IGNORE_ACTORS]: [],
  })

module.exports.saveStateReaderConfiguration = (_taskArgs, _hre) =>
  Promise.resolve({})
    .then(addSupportedChains)
    .then(addProtocols(_taskArgs))
    .then(addIdentity)
    .then(addDb(_taskArgs))
    .then(addIgnoredActors)
    .then(addWarmUpTime)
    .then(addFireChallengeThreshold)
    .then(addCheckInactivityInterval)
    .then(
      maybeSaveConfiguration(
        _taskArgs,
        'State reader',
        `${PATH_TO_CHALLENGER_APP}/challenger.config.json`
      )
    )
