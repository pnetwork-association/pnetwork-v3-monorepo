const R = require('ramda')
const { db } = require('ptokens-utils')
const { MEM_ACTOR_STATUS } = require('./constants')

module.exports.updateActorStatus = R.curry((_actorsStorage, _actorStatus, _actorAddress) =>
  db.updateReportById(_actorsStorage, { $set: { [MEM_ACTOR_STATUS]: _actorStatus } }, _actorAddress)
)
