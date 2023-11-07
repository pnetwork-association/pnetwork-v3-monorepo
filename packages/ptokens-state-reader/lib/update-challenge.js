const R = require('ramda')
const { db } = require('ptokens-utils')
const constants = require('ptokens-constants')

module.exports.updateChallengeStatus = R.curry((_challengesStorage, _challenge, _challengeStatus) =>
  db.updateReport(
    _challengesStorage,
    {
      $set: {
        [constants.db.KEY_STATUS]: _challengeStatus,
      },
    },
    { actor: _challenge.actor, networkId: _challenge.networkId, nonce: _challenge.nonce }
  )
)
