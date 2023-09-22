const R = require('ramda')
const errors = require('../errors')
const { logger } = require('../get-logger')
const { MerkleTree } = require('merkletreejs')
const constants = require('ptokens-constants')
const { keccak256, encodePacked } = require('viem')

module.exports.getMerkleProof = (_collection, _myAddress) =>
  logger.info('Getting proof...') ||
  _collection
    .find({ _id: /guardianspropagated/ })
    .sort({ [constants.db.KEY_WITNESSED_TS]: -1 })
    .toArray()
    .then(R.propOr({}, 0))
    .then(R.prop(constants.db.KEY_EVENT_ARGS))
    .then(([_epoch, _guardians]) => {
      if (R.isNil(_epoch) || R.isNil(_guardians))
        return Promise.reject(
          new Error(
            `${errors.ERROR_NIL_ARGUMENTS}: can't get any proof, epoch (${_epoch}) & guardians (${_guardians}) are undefined!`
          )
        )

      logger.info(
        `Event found for epoch ${_epoch} with ${_guardians.length} guardians registered, computing Merkle path...`
      )

      const leaves = _guardians.map(_address => keccak256(encodePacked(['address'], [_address])))
      const tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
      const myLeaf = keccak256(encodePacked(['address'], [_myAddress]))
      const proof = tree.getProof(myLeaf)
      logger.info('Merkle path computed successfully!')

      return proof
    })
