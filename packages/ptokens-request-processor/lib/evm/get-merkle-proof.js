const R = require('ramda')
const errors = require('../errors')
const { logger } = require('../get-logger')
const { MerkleTree } = require('merkletreejs')
const constants = require('ptokens-constants')
const { keccak256, encodePacked } = require('viem')

module.exports.getMerkleProof = (_collection, _myAddress) =>
  logger.info('Getting proof...') ||
  _collection
    .find({ _id: new RegExp(constants.db.eventNames.ACTORS_PROPAGATED.toLowerCase()) })
    .sort({ [constants.db.KEY_WITNESSED_TS]: -1 })
    .toArray()
    .then(R.propOr({}, 0))
    .then(R.propOr([], constants.db.KEY_EVENT_ARGS))
    .then(([_epoch, _actors, _actorsTypes]) => {
      if (R.isNil(_epoch) || R.isNil(_actors) || R.isNil(_actorsTypes))
        return Promise.reject(
          new Error(
            `${errors.ERROR_NIL_ARGUMENTS}: can't get any proof, epoch (${_epoch}) or actors (${_actors}) or actorTypes (${_actorsTypes})  are undefined!`
          )
        )

      if (_actors.length !== _actorsTypes.length) {
        return Promise.reject(new Error('Actors and actorTypes length do not match!'))
      }

      logger.info(
        `Event found for epoch ${_epoch} with ${_actors.length} guardians registered, computing Merkle path...`
      )

      const leaves = _actors.map((_address, _index) =>
        keccak256(encodePacked(['address', 'uint8'], [_address, _actorsTypes[_index]]))
      )
      const tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
      const myIndex = _actors.indexOf(_myAddress)
      if (myIndex === -1) {
        return Promise.reject(
          new Error(
            `Address ${_myAddress} of mine not found in the ActorsPropagated event, aborting merkle proof computation...`
          )
        )
      }

      const myType = _actorsTypes[myIndex]
      if (myType !== constants.hub.actors.Guardian) {
        return Promise.reject(
          new Error(`Wrong on chain ActorType for address '${_myAddress}', aborting...`)
        )
      }

      const myLeaf = keccak256(encodePacked(['address', 'uint8'], [_myAddress, myType]))
      const proof = tree.getHexProof(myLeaf)
      const root = tree.getHexRoot()

      logger.info('Merkle path computed successfully')
      logger.info(`  root: ${root}`)
      logger.info(`  proof: [${proof}]`)

      // return proof.map(_elem => _elem.data)
      return proof
    })
