const {
  MEM_EPOCH,
  MEM_ACTOR,
  MEM_TIMESTAMP,
  MEM_SYNC_STATE,
  MEM_ACTOR_STATUS,
} = require('./constants')
const R = require('ramda')
const { db } = require('ptokens-utils')
const constants = require('ptokens-constants')

/**
 * Store an object like this
 * {
 *   epoch: 1,
 *   actor: "0x...",
 *   status: {
 *     0x1234: "Active",
 *     0x4567: "Active",
 *   },
 *   timestamp: 16999101,
 *   syncState: <sync-state-schema-here>
 * }
 */
module.exports.refreshActorStatus = R.curry((_actorsStorage, _epoch, _actorAddress, _syncState) =>
  Promise.resolve(
    Object.keys(_syncState).reduce(
      (_result, _networkId) => ({ ..._result, [_networkId]: constants.hub.actorsStatus.Active }),
      {}
    )
  ).then(_statuses =>
    db.updateReport(
      _actorsStorage,
      {
        $set: {
          _id: R.toLower(_actorAddress),
          [MEM_EPOCH]: _epoch,
          [MEM_ACTOR]: R.toLower(_actorAddress),
          [MEM_ACTOR_STATUS]: _statuses,
          [MEM_TIMESTAMP]: Date.now(),
          [MEM_SYNC_STATE]: _syncState,
        },
      },
      {}
    )
  )
)
