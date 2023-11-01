const R = require('ramda')
const { db } = require('ptokens-utils')
const constants = require('ptokens-constants')

module.exports.updateChallenge = R.curry(
  (_challengesStorage, _actor, _networkId, _challengeStatus) =>
    db.updateReport(
      _challengesStorage,
      {
        $set: {
          [constants.db.KEY_STATUS]: _challengeStatus,
        },
      },
      { actor: _actor, networkId: _networkId }
    )
)
