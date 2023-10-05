const { types } = require('hardhat/config')
const { getHubAddress } = require('../lib/configuration-manager')
const TASK_CONSTANTS = require('../constants')
const {
  parseUserOperationFromReport,
} = require('ptokens-request-processor/lib/evm/evm-parse-user-operation')

const TASK_NAME = 'pnetworkhub:cancel'
const TASK_DESC = 'Perform a Guardian cancel operation on the deployed PNetworkHub contract'
const TASK_PARAM_JSON = 'json'
const TASK_PARAM_JSON_DESC = 'Stringified JSON of the event report stored in mongo by a listener.'

const protocolExecuteOperation = async (taskArgs, hre) => {
  const hubAddress = await getHubAddress(hre)

  console.info(`PNetworkHub contract detected @ ${hubAddress}`)
  const hubContract = await hre.ethers.getContractFactory('PNetworkHub')
  const PNetworkHub = await hubContract.attach(hubAddress)

  console.info('Calling protocolGuardianCancelOperation...')

  const json = JSON.parse(taskArgs[TASK_PARAM_JSON])

  const proof = '0x'
  const args = await parseUserOperationFromReport(json)
  args.push(proof)
  console.log(args)
  const tx = await PNetworkHub.protocolGuardianCancelOperation(...args, {
    gasLimit: taskArgs[TASK_CONSTANTS.PARAM_NAME_GAS],
    gasPrice: taskArgs[TASK_CONSTANTS.PARAM_NAME_GASPRICE],
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
