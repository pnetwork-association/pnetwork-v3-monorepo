const { types } = require('hardhat/config')
const { getStateManagerAddress } = require('../lib/configuration-manager')
const {
  getUserOperationAbiArgsFromReport,
} = require('ptokens-request-processor/lib/evm/evm-abi-manager')

const TASK_NAME_PROTOCOL_QUEUE = 'statemanager:queue'
const TASK_DESC_PROTOCOL_QUEUE = 'Perform a queue operation on the deployed StateManager contract'
const TASK_PARAM_JSON = 'json'
const TASK_PARAM_JSON_DESC = 'Stringified JSON of the event report stored in mongo by a listener.'

const protocolExecuteOperation = async (taskArgs, hre) => {
  const stateManagerAddress = await getStateManagerAddress(hre)

  console.info(`StateManager contract detected @ ${stateManagerAddress}`)
  const StateManagerContract = await hre.ethers.getContractFactory('StateManager')
  const StateManager = await StateManagerContract.attach(stateManagerAddress)

  console.info('Calling protocolQueueOperation...')

  const json = JSON.parse(taskArgs[TASK_PARAM_JSON])

  const args = await getUserOperationAbiArgsFromReport(json)
  console.log(args)
  const tx = await StateManager.protocolQueueOperation(args[0], { value: 1 })
  const receipt = await tx.wait(1)

  console.info(`Tx mined @ ${receipt.transactionHash}`)
}

task(
  TASK_NAME_PROTOCOL_QUEUE,
  TASK_DESC_PROTOCOL_QUEUE,
  protocolExecuteOperation
).addPositionalParam(TASK_PARAM_JSON, TASK_PARAM_JSON_DESC, undefined, types.string)

module.exports = {
  TASK_NAME_PROTOCOL_QUEUE,
}
