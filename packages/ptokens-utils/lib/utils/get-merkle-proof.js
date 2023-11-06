const R = require('ramda')
const ethers = require('ethers')
const errors = require('../errors')
const { logger } = require('../logger')
const { MerkleTree } = require('merkletreejs')

const getMerkleProofSync = R.curry((_epoch, _actors, _actorsTypes, _myAddress) => {
  if (_actors.length !== _actorsTypes.length) {
    throw new Error('Actors and actorTypes length do not match!')
  }

  const lowerCasedActors = _actors.map(R.toLower)
  const leaves = lowerCasedActors.map((_address, _index) =>
    ethers.solidityPackedKeccak256(['address', 'uint8'], [_address, _actorsTypes[_index]])
  )
  const tree = new MerkleTree(leaves, ethers.keccak256, { sortPairs: true })
  const myIndex = lowerCasedActors.indexOf(_myAddress.toLowerCase())
  if (myIndex === -1) {
    throw new Error(`${errors.ERROR_ADDRESS_NOT_FOUND} in ${_actors}`)
  }

  const myType = _actorsTypes[myIndex]
  const myLeaf = ethers.solidityPackedKeccak256(['address', 'uint8'], [_myAddress, myType])
  const proof = tree.getHexProof(myLeaf)
  const root = tree.getHexRoot()

  logger.debug('Merkle path computed successfully')
  logger.debug(`  address: ${_myAddress}`)
  logger.debug(`  root: ${root}`)
  logger.debug(`  proof: [${proof}]`)

  return proof
})

const getMerkleProof = R.curry(
  (_epoch, _actors, _actorsTypes, _myAddress) =>
    new Promise((resolve, reject) => {
      try {
        return resolve(getMerkleProofSync(_epoch, _actors, _actorsTypes, _myAddress))
      } catch (err) {
        return reject(err)
      }
    })
)

module.exports = {
  getMerkleProof,
  getMerkleProofSync,
}
