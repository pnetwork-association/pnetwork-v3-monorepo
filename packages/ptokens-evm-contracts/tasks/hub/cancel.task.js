const { types } = require('hardhat/config')
const { getHubAddress } = require('../lib/configuration-manager')
const { utils } = require('ptokens-utils')
const TASK_CONSTANTS = require('../constants')
const constants = require('ptokens-constants')
const {
  OPT_NAME_PROOF,
  OPT_DESC_PROOF,
  PARAM_ACTORS_PROPAGATED_JSON,
  PARAM_ACTORS_PROPAGATED_JSON_DESC,
} = require('../constants')
const {
  parseUserOperationFromReport,
} = require('ptokens-request-processor/lib/evm/evm-parse-user-operation')
const TASK_NAME = 'hub:cancel'
const TASK_DESC = 'Perform a Guardian cancel operation on the deployed PNetworkHub contract'
const TASK_PARAM_JSON = 'json'
const TASK_PARAM_JSON_DESC = 'Stringified JSON of the event report stored in mongo by a listener.'
const TASK_PARAM_ACTOR_TYPE = 'actorType'
const TASK_PARAM_ACTOR_TYPE_DESC = 'The number relative to the actor type (check the enum)'

const fromHexString = hexString =>
  Uint8Array.from(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))

const protocolExecuteOperation = async (taskArgs, hre) => {
  const hubAddress = await getHubAddress(hre)

  console.info(`PNetworkHub contract detected @ ${hubAddress}`)
  const hubContract = await hre.ethers.getContractFactory('PNetworkHub')
  const PNetworkHub = await hubContract.attach(hubAddress)

  console.info('Calling protocolCancelOperation...')

  const actorType = taskArgs[TASK_PARAM_ACTOR_TYPE]
  const json = taskArgs[TASK_PARAM_JSON]

  const proofArg = taskArgs[OPT_NAME_PROOF]
  const actorsPropagatedEvent = taskArgs[PARAM_ACTORS_PROPAGATED_JSON]
  const [signer] = await hre.ethers.getSigners()
  const actorAddress = signer.address
  console.log('signer:', signer.address)

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

  const id = (await utils.getEventId(json)).slice(2)
  console.log('Operation id:', id)

  const operationId = fromHexString(id)
  console.log('operationId:', operationId.length)
  const signature = await signer.signMessage(operationId)

  console.log('Proof:', proof)
  console.log('signature:', signature)

  const args = await parseUserOperationFromReport(json)

  console.log('args:', args)
  const tx = await PNetworkHub.protocolCancelOperation(...args, actorType, proof, signature, {
    gasLimit: taskArgs[TASK_CONSTANTS.PARAM_NAME_GAS],
    gasPrice: taskArgs[TASK_CONSTANTS.PARAM_NAME_GASPRICE],
  })
  const receipt = await tx.wait(1)

  console.info(`Tx mined @ ${receipt.transactionHash}`)
}

task(TASK_NAME, TASK_DESC, protocolExecuteOperation)
  .addPositionalParam(TASK_PARAM_ACTOR_TYPE, TASK_PARAM_ACTOR_TYPE_DESC, undefined, types.int)
  .addPositionalParam(TASK_PARAM_JSON, TASK_PARAM_JSON_DESC, undefined, types.json)
  .addOptionalParam(
    PARAM_ACTORS_PROPAGATED_JSON,
    PARAM_ACTORS_PROPAGATED_JSON_DESC,
    undefined,
    types.json
  )
  .addOptionalParam(OPT_NAME_PROOF, OPT_DESC_PROOF, undefined, types.json)

module.exports = {
  TASK_NAME,
}
