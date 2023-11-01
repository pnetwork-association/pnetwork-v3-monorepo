const R = require('ramda')
const { logic } = require('ptokens-utils')
const constants = require('ptokens-constants')

module.exports.lowerCaseIgnoredActorsAndAddToState = _state => {
  const ignoredActors = _state[constants.config.KEY_IGNORE_ACTORS]

  return logic
    .mapAll(R.toLower, ignoredActors)
    .then(_lowerCased => R.assoc(constants.config.KEY_IGNORE_ACTORS, _lowerCased, _state))
}
