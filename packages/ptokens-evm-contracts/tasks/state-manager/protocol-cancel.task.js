const { types } = require('hardhat/config')
const { getStateManagerAddress } = require('../lib/configuration-manager')
const { TASK_PARAM_GASPRICE, TASK_PARAM_GASLIMIT } = require('../constants')
const {
  getUserOperationAbiArgsFromReport,
} = require('ptokens-request-processor/lib/evm/evm-abi-manager')

const TASK_NAME = 'pnetworkhub:cancel'
const TASK_DESC = 'Perform a Guardian cancel operation on the deployed PNetworkHub contract'
const TASK_PARAM_JSON = 'json'
const TASK_PARAM_JSON_DESC = 'Stringified JSON of the event report stored in mongo by a listener.'

const protocolExecuteOperation = async (taskArgs, hre) => {
  const stateManagerAddress = await getStateManagerAddress(hre)

  console.info(`PNetworkHub contract detected @ ${stateManagerAddress}`)
  const StateManagerContract = await hre.ethers.getContractFactory('PNetworkHub')
  const PNetworkHub = await StateManagerContract.attach(stateManagerAddress)

  console.info('Calling protocolGuardianCancelOperation...')

  const json = JSON.parse(taskArgs[TASK_PARAM_JSON])

  const proof = '0x'
  const args = await getUserOperationAbiArgsFromReport(json)
  args.push(proof)
  console.log(args)
  const tx = await PNetworkHub.protocolGuardianCancelOperation(...args, {
    gasLimit: taskArgs[TASK_PARAM_GASLIMIT],
    gasPrice: taskArgs[TASK_PARAM_GASPRICE],
  })
  const receipt = await tx.wait(1)

  console.info(`Tx mined @ ${receipt.transactionHash}`)
}

task(TASK_NAME, TASK_DESC, protocolExecuteOperation).addPositionalParam(
  TASK_PARAM_JSON,
  TASK_PARAM_JSON_DESC,
  undefined,
  types.string
)

module.exports = {
  TASK_NAME,
}
