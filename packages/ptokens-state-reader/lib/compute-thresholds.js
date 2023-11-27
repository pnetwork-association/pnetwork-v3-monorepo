const R = require('ramda')
const constants = require('ptokens-constants')
const { STATE_BLOCK_TIMES_ESTIMATIONS_KEY, STATE_BLOCK_THRESHOLDS_KEY } = require('./constants')

const getThreshold = (_blockTime, _fireChallengeThreshold) =>
  Math.floor(_fireChallengeThreshold / _blockTime)

const getThresholdsFromBlockTimes = (_blockTimes, _fireChallengeThreshold) =>
  Promise.resolve(
    R.keys(_blockTimes).reduce(
      (_result, _networkId) => ({
        ..._result,
        [_networkId]: getThreshold(_blockTimes[_networkId], _fireChallengeThreshold),
      }),
      {}
    )
  )

module.exports.computeThresholdsFromBlockTimesAndAddToState = _state =>
  new Promise((resolve, reject) => {
    const blockTimes = _state[STATE_BLOCK_TIMES_ESTIMATIONS_KEY]
    const fireChallengeThreshold = _state[constants.config.KEY_FIRE_CHALLENGE_THRESHOLD]

    return getThresholdsFromBlockTimes(blockTimes, fireChallengeThreshold)
      .then(_thresholds => R.assoc(STATE_BLOCK_THRESHOLDS_KEY, _thresholds, _state))
      .then(resolve)
      .then(reject)
  })
