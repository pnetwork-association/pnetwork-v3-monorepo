const R = require('ramda')
const { db } = require('ptokens-utils')
const { logger } = require('./get-logger')
const constants = require('ptokens-constants')
const { MEM_ACTOR_STATUS } = require('./constants')

const getActorStatus = R.curry((_actorsStorage, _actorAddress, _networkId) =>
  db.findReportById(_actorsStorage, _actorAddress).then(R.path([MEM_ACTOR_STATUS, _networkId]))
)

const isActorStatusEqualToSomething = R.curry(
  (_something, _actorsStorage, _actorAddress, _networkId) =>
    logger.info(`Checking if actor '${_actorAddress}' status is equal to '${_something}'...`) ||
    getActorStatus(_actorsStorage, _actorAddress)
      .then(R.equals(_something))
      .then(_value =>
        _value
          ? logger.info(`Actor '${_actorAddress}' is '${_something}'`) || true
          : logger.info(`Actor '${_actorAddress}' is not '${_something}'`) || false
      )
      .catch(_ => logger.info(`Actor '${_actorAddress}' is not '${_something}'`) || false)
)

const isActorStatusActive = isActorStatusEqualToSomething(constants.hub.actorsStatus.Active)
const isActorStatusChallenged = isActorStatusEqualToSomething(constants.hub.actorsStatus.Challenged)

module.exports = {
  isActorStatusActive,
  isActorStatusChallenged,
  getActorStatus,
}
