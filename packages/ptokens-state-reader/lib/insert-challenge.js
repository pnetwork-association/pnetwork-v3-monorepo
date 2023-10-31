const R = require('ramda')
const { db } = require('ptokens-utils')
const { logger } = require('./get-logger')
const constants = require('ptokens-constants')

module.exports.insertChallengePending = R.curry((_storage, _challenge) =>
  Promise.resolve({
    ..._challenge,
    [constants.db.KEY_ID]: `${_challenge.networkId}-${_challenge.nonce}`,
    [constants.db.KEY_STATUS]: constants.hub.challengeStatus.PENDING,
  })
    .then(db.insertReport(_storage))
    .catch(_err =>
      _err.message.includes('duplicate key')
        ? logger.warn('Challenge already inserted') || Promise.resolve()
        : Promise.reject(_err)
    )
)
