const R = require('ramda')
const { utils } = require('ptokens-utils')
const constants = require('ptokens-constants')
const { MEM_ACTOR_STATUS } = require('./constants')
const { ERROR_UNDEFINED_ACTOR_STATUS } = require('./errors')
const { getActorFromStorage } = require('./get-actor-from-storage')

const getActorStatus = R.curry((_actorsStorage, _actorAddress, _networkId) =>
  getActorFromStorage(_actorsStorage, _actorAddress)
    .then(R.path([MEM_ACTOR_STATUS, _networkId]))
    .then(utils.rejectIfNil(ERROR_UNDEFINED_ACTOR_STATUS))
)

const isActorStatusEqualToSomething = R.curry(
  (_something, _actorsStorage, _actorAddress, _networkId) =>
    getActorStatus(_actorsStorage, _actorAddress, _networkId).then(_status =>
      _status === _something ? true : false
    )
)

const isActorStatusActive = isActorStatusEqualToSomething(constants.hub.actorsStatus.Active)
const isActorStatusChallenged = isActorStatusEqualToSomething(constants.hub.actorsStatus.Challenged)

module.exports = {
  isActorStatusActive,
  isActorStatusChallenged,
  getActorStatus,
}
