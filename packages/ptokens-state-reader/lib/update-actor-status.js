const R = require('ramda')
const { db } = require('ptokens-utils')
const { MEM_ACTOR_STATUS } = require('./constants')

module.exports.updateActorStatus = R.curry(
  (_actorsStorage, _actorStatus, _actorAddress, _networkId) =>
    db.updateReportById(
      _actorsStorage,
      {
        $set: {
          [MEM_ACTOR_STATUS]: {
            [_networkId]: _actorStatus,
          },
        },
      },
      _actorAddress
    )
)
