const R = require('ramda')
const constants = require('ptokens-constants')
const { utils } = require('ptokens-utils')
const { Challenge } = constants.hub
const { ERROR_NO_CHALLENGE_FOUND } = require('../../errors')

module.exports.extractChallengeFromReceipt = R.curry((_hub, _receipt) =>
  Promise.resolve(_receipt)
    .then(R.prop('logs'))
    .then(R.map(_log => _hub.interface.parseLog(_log)))
    .then(R.filter(R.identity))
    .then(R.filter(R.propEq(constants.db.eventNames.CHALLENGE_PENDING, 'name')))
    .then(R.prop(0))
    .then(utils.rejectIfNil(`${ERROR_NO_CHALLENGE_FOUND}: ${JSON.stringify(_receipt)}`))
    .then(Challenge.fromArgs)
)
