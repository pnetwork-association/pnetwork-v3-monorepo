const R = require('ramda')
const constants = require('ptokens-constants')
const { STATE_PENDING_CHALLENGES } = require('./state/constants')

module.exports.maybeGetPendingChallengesAndPutInState = _state =>
  new Promise((resolve, reject) => {
    const collection = _state[constants.state.KEY_DB]
    return collection
      .find({ _id: /challengepending/ })
      .sort({ [constants.db.KEY_WITNESSED_TS]: 1 })
      .toArray()
      .then(_pendingChallenges => R.assoc(STATE_PENDING_CHALLENGES, _pendingChallenges, _state))
      .then(resolve)
      .then(reject)
  })
