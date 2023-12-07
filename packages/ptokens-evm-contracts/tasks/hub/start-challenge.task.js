const { utils } = require('ptokens-utils')
const { types } = require('hardhat/config')
const { getHubAddress } = require('../lib/configuration-manager')
const {
  OPT_NAME_PROOF,
  OPT_DESC_PROOF,
  PARAM_NAME_GAS,
  PARAM_NAME_GASPRICE,
  PARAM_ACTORS_PROPAGATED_JSON,
  PARAM_ACTORS_PROPAGATED_JSON_DESC,
} = require('../constants')
const constants = require('ptokens-constants')
const TASK_DESC = 'Starts a new challenge'
const TASK_NAME = 'hub:start-challenge'
const PARAM_NAME_ACTOR_ADDRESS = 'sentinelAddress'
const PARAM_DESC_ACTOR_ADDRESS = 'The sentinel address'
const PARAM_NAME_ACTOR_TYPE = 'actorType'
const PARAM_DESC_ACTOR_TYPE = 'The type of the actor (sentinel or guardian)'

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
  const proofArg = _args[OPT_NAME_PROOF]
  const actorsPropagatedEvent = _args[PARAM_ACTORS_PROPAGATED_JSON_DESC]

  let proof = null
  if (proofArg) {
    proof = proofArg
  } else if (actorsPropagatedEvent) {
    const actors = actorsPropagatedEvent[constants.db.KEY_EVENT_ARGS][1]
    const actorsTypes = actorsPropagatedEvent[constants.db.KEY_EVENT_ARGS][2]
    proof = await utils.getMerkleProof(0, actors, actorsTypes, actorAddress)
  } else {
    throw Error(
      `Either one of --${OPT_NAME_PROOF} or --${PARAM_ACTORS_PROPAGATED_JSON} is required!`
    )
  }

  console.log('Proof:', proof)
  const amountToLock = parseInt(await hub.lockedAmountStartChallenge())

  console.log('actorAddress:', actorAddress)
  console.log('actorType:', actorType)
  console.log('proof:', proof)
  console.log('amountToLock:', amountToLock)

  const tx = await hub.startChallenge(actorAddress, actorType, proof, {
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
  .addOptionalParam(
    PARAM_ACTORS_PROPAGATED_JSON,
    PARAM_ACTORS_PROPAGATED_JSON_DESC,
    undefined,
    types.json
  )
  .addOptionalParam(OPT_NAME_PROOF, OPT_DESC_PROOF, undefined, types.json)
  .setAction(startChallenge)

module.exports = {
  TASK_NAME,
}
