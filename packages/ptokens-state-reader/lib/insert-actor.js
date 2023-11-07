const {
  MEM_EPOCH,
  MEM_ACTOR,
  MEM_TIMESTAMP,
  MEM_SYNC_STATE,
  MEM_ACTOR_STATUS,
} = require('./constants')
const R = require('ramda')
const { db } = require('ptokens-utils')

module.exports.insertActor = R.curry(
  (_actorsStorage, _epoch, _actorAddress, _actorStatus, _syncState) =>
    db.updateReport(
      _actorsStorage,
      {
        $set: {
          _id: _actorAddress,
          [MEM_EPOCH]: _epoch,
          [MEM_ACTOR]: R.toLower(_actorAddress),
          [MEM_ACTOR_STATUS]: _actorStatus,
          [MEM_TIMESTAMP]: Date.now(),
          [MEM_SYNC_STATE]: _syncState,
        },
      },
      {}
    )
)
