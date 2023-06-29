const { types } = require('hardhat/config')
const { getStateManagerAddress } = require('../lib/configuration-manager')
const {
  getUserOperationAbiArgsFromReport,
} = require('ptokens-request-processor/lib/evm/evm-abi-manager')
const TASK_NAME = 'statemanager:status'
const TASK_DESC = 'Check the status of a given operation'
const TASK_PARAM_JSON = 'json'
const TASK_PARAM_JSON_DESC = 'Stringified JSON of the event report stored in mongo by a listener.'

const protocolStatusOfTask = async (taskArgs, hre) => {
  const stateManagerAddress = await getStateManagerAddress(hre)

  console.info(`StateManager contract detected @ ${stateManagerAddress}`)
  const StateManagerContract = await hre.ethers.getContractFactory('StateManager')
  const stateManager = await StateManagerContract.attach(stateManagerAddress)
  console.info('Calling operationStatusOf...')

  const json = JSON.parse(taskArgs[TASK_PARAM_JSON])
  const args = await getUserOperationAbiArgsFromReport(json)
  const result = await stateManager.operationStatusOf(...args)

  console.info(result)
}

task(TASK_NAME, TASK_DESC, protocolStatusOfTask).addPositionalParam(
  TASK_PARAM_JSON,
  TASK_PARAM_JSON_DESC,
  undefined,
  types.string
)

module.exports = {
  TASK_NAME,
}
