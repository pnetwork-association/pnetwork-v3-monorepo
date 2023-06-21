const R = require('ramda')
const { types } = require('hardhat/config')

const TASK_NAME_ERC20_TRANSFER = 'erc20:transfer'
const TASK_DESC_ERC20_TRANSFER = 'Transfer an amount of tokens to the specified destination address'
const TASK_PARAM_TOKEN_ADDRESS = 'tokenAddress'
const TASK_PARAM_DESTINATION = 'destinationAddress'
const TASK_PARAM_AMOUNT = 'amount'

const waitTxReceipt = R.invoker(0, 'wait')
const attachToAddress = R.invoker(1, 'attach')
const transfer = R.invoker(2, 'transfer')
const printTxHash = _tx => console.info(`Tx mined @ ${_tx.transactionHash}`)

const erc20Transfer = (taskArgs, hre) =>
  Promise.resolve(hre.ethers.getContractFactory('ERC20'))
    .then(attachToAddress(taskArgs[TASK_PARAM_TOKEN_ADDRESS]))
    .then(transfer(taskArgs[TASK_PARAM_DESTINATION], taskArgs[TASK_PARAM_AMOUNT]))
    .then(waitTxReceipt)
    .then(printTxHash)

task(TASK_NAME_ERC20_TRANSFER, TASK_DESC_ERC20_TRANSFER, erc20Transfer)
  .addPositionalParam(TASK_PARAM_TOKEN_ADDRESS, 'Token address', undefined, types.string)
  .addPositionalParam(
    TASK_PARAM_DESTINATION,
    'Destination address where the token will be received',
    undefined,
    types.string
  )
  .addPositionalParam(TASK_PARAM_AMOUNT, 'Amount to transfer', undefined, types.int)
