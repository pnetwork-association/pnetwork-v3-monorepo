const { types } = require('hardhat/config')
const { MerkleTree } = require('merkletreejs')
const { getHubAddress } = require('../lib/configuration-manager')
const { PARAM_NAME_GASPRICE, PARAM_NAME_GAS } = require('../constants')
const constants = require('ptokens-constants')
const TASK_DESC = 'Starts a new challenge'
const TASK_NAME = 'hub:start-challenge'
const PARAM_NAME_ACTOR_ADDRESS = 'sentinelAddress'
const PARAM_DESC_ACTOR_ADDRESS = 'The sentinel address'
const PARAM_NAME_ACTOR_TYPE = 'actorType'
const PARAM_DESC_ACTOR_TYPE = 'The type of the actor (sentinel or guardian)'
const PARAM_NAME_ACTORS_PROPAGATED_EVENT = 'actorsPropagatedJson'
const PARAM_DESC_ACTORS_PROPAGATED_EVENT =
  'JSON given by the listener when getting the ActorsPropagated event'

const getActorsMerkleProof = ({ actors, actor, types, type }) => {
  const leaves = actors.map((address, _index) =>
    ethers.utils.solidityKeccak256(['address', 'uint8'], [address, types[_index]])
  )
  const merkleTree = new MerkleTree(leaves, ethers.utils.keccak256, { sortPairs: true })
  return merkleTree.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint8'], [actor, type]))
}

const startChallenge = async (_args, _hre) => {
  const challenger = await _hre.ethers.getSigner()
  console.log('challenger.address:', challenger.address)

  const PNetworkHub = await _hre.ethers.getContractFactory('PNetworkHub')
  const hubAddress = await getHubAddress(_hre)
  console.log('hub.address:', hubAddress)
  const hub = await PNetworkHub.attach(hubAddress)

  const actorAddress = _args[PARAM_NAME_ACTOR_ADDRESS]
  const actorType = _args[PARAM_NAME_ACTOR_TYPE]
  const gasLimit = _args[PARAM_NAME_GAS]
  const gasPrice = _args[PARAM_NAME_GASPRICE]
  const actorsPropagatedEvent = JSON.parse(_args[PARAM_NAME_ACTORS_PROPAGATED_EVENT])
  const actors = actorsPropagatedEvent[constants.db.KEY_EVENT_ARGS][1]
  const actorsTypes = actorsPropagatedEvent[constants.db.KEY_EVENT_ARGS][2]
  const proof = getActorsMerkleProof({
    actors,
    actor: actorAddress,
    types: actorsTypes,
    type: actorType,
  })
  console.log('Proof:', proof)
  const amountToLock = parseInt(await hub.lockedAmountStartChallenge())

  console.log('actorAddress:', actorAddress)
  console.log('actorType:', actorType)
  console.log('proof:', proof)
  console.log('amountToLock:', amountToLock)

  const tx = await hub.callStatic.startChallenge(actorAddress, actorType, proof, {
    value: amountToLock,
    gasPrice,
    gasLimit,
  })

  const receipt = await tx.wait(1)

  console.info(`Tx mined @ ${receipt.transactionHash}`)
}

task(TASK_NAME, TASK_DESC)
  .addPositionalParam(PARAM_NAME_ACTOR_ADDRESS, PARAM_DESC_ACTOR_ADDRESS, undefined, types.string)
  .addPositionalParam(PARAM_NAME_ACTOR_TYPE, PARAM_DESC_ACTOR_TYPE, undefined, types.int)
  .addPositionalParam(
    PARAM_NAME_ACTORS_PROPAGATED_EVENT,
    PARAM_DESC_ACTORS_PROPAGATED_EVENT,
    undefined,
    types.string
  )
  .setAction(startChallenge)

module.exports = {
  TASK_NAME,
}
