const R = require('ramda')
const { db, utils, logic } = require('ptokens-utils')
const {
  STATE_PROOFS_KEY,
  STATE_DB_ACTORS_PROPAGATED_KEY,
  ID_ACTORS_PROPAGATED,
} = require('./constants')

const buildProofsObject = ({ currentEpoch, actors, actorsTypes }) =>
  logic.mapAll(utils.getMerkleProof(currentEpoch, actors, actorsTypes), actors).then(_proofs =>
    actors.reduce(
      (_result, _actor, _index) => ({
        ..._result,
        [_actor]: _proofs[_index],
      }),
      {}
    )
  )

module.exports.computeMerkleProofsForEachActorAndAddToState = _state =>
  new Promise((resolve, reject) => {
    const actorsPropagatedStorage = _state[STATE_DB_ACTORS_PROPAGATED_KEY]

    return db
      .findReportById(actorsPropagatedStorage, ID_ACTORS_PROPAGATED)
      .then(buildProofsObject)
      .then(_proofObj => R.assoc(STATE_PROOFS_KEY, _proofObj, _state))
      .then(resolve)
      .catch(reject)
  })
