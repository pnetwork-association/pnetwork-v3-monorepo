const { types } = require('hardhat/config')
const { getStateManagerAddress } = require('../lib/configuration-manager')
const {
  getUserOperationAbiArgsFromReport,
} = require('ptokens-request-processor/lib/evm/evm-abi-manager')
const { TASK_PARAM_GASPRICE, TASK_PARAM_GASLIMIT } = require('../constants')

const TASK_NAME = 'pnetworkhub:execute'
const TASK_DESC = 'Perform an execute operation on the deployed PNetworkHub contract'
const TASK_PARAM_JSON = 'json'
const TASK_PARAM_JSON_DESC = 'Stringified JSON of the event report stored in mongo by a listener.'

/* Example: (or just copy the report from mongo)
{
  "_id": "id",
  "status": "detected",
  "eventName": "OperationQueued",
  "nonce": "1",
  "destinationAccount": "0x989afaFBd9135445DA1581e8670B68C7fdf19175",
  "destinationNetworkId": "0xfc8ebb2b",
  "underlyingAssetName": "USD//C on xDai",
  "underlyingAssetSymbol": "USDC",
  "underlyingAssetDecimals": 6,
  "underlyingAssetTokenAddress": "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83",
  "underlyingAssetNetworkId": "0xd41b1c5b",
  "assetTokenAddress": null,
  "assetAmount": "100000000000000000000",
  "userData": "0x",
  "optionsMask": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "originatingBlockHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "originatingAddress": null,
  "originatingNetworkId": "0xd41b1c5b",
  "originatingTransactionHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "blockHash": "0xdef19c3c7b19e9e1ed439039eda002332c4b4e891f2cd300c23382f6cfd89ce0",
  "networkId": "0xfc8ebb2b",
  "transactionHash": "0xa2f2ab40c1b4de2c2769fcd3db1dcd1d461f09426c965e492ef8e8ead0ed5a4a",
  "proposedTransactionTimestamp": null,
  "proposedTransactionHash": null,
  "witnessedTimestamp": "2023-06-27T17:52:50.154Z",
  "finalTransactionHash": null,
  "finalTransactionTimestamp": null
}
*/
const protocolExecuteOperation = async (taskArgs, hre) => {
  const stateManagerAddress = await getStateManagerAddress(hre)

  console.info(`PNetworkHub contract detected @ ${stateManagerAddress}`)
  const StateManagerContract = await hre.ethers.getContractFactory('PNetworkHub')
  const hub = await StateManagerContract.attach(stateManagerAddress)
  const lockedAmountChallengePeriod = await hub.lockedAmountChallengePeriod()
  console.info('Calling protocolExecuteOperation w/', lockedAmountChallengePeriod)

  const json = JSON.parse(taskArgs[TASK_PARAM_JSON])

  const args = await getUserOperationAbiArgsFromReport(json)
  args.push({
    value: lockedAmountChallengePeriod,
    gasLimit: taskArgs[TASK_PARAM_GASLIMIT],
    gasPrice: taskArgs[TASK_PARAM_GASPRICE],
  })
  console.log(args)
  const tx = await hub.protocolExecuteOperation(...args)
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
