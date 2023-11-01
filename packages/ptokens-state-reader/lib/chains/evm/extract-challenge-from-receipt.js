const R = require('ramda')
const constants = require('ptokens-constants')
const { utils } = require('ptokens-utils')
const { Challenge } = constants.hub
const { ERROR_NO_CHALLENGE_FOUND } = require('../../errors')

const filterForChallengeEvents = R.filter(
  R.compose(R.equals(1), R.length, R.match(/Challenge/), R.prop('name'))
)

module.exports.extractChallengeFromReceipt = R.curry((_hub, _receipt) =>
  Promise.resolve(_receipt)
    .then(R.prop('logs'))
    .then(R.map(_log => _hub.interface.parseLog(_log)))
    .then(R.filter(R.identity))
    .then(filterForChallengeEvents)
    .then(R.prop(0))
    .then(utils.rejectIfNil(`${ERROR_NO_CHALLENGE_FOUND}: ${JSON.stringify(_receipt)}`))
    .then(Challenge.fromArgs)
)
