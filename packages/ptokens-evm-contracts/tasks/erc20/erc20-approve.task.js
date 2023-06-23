const R = require('ramda')
const { types } = require('hardhat/config')

const TASK_NAME_ERC20_APPROVE = 'erc20:approve'
const TASK_DESC_ERC20_APPROVE =
  'Appove the specified quantity of tokens to be spent by the specified address'
const TASK_PARAM_TOKEN_ADDRESS = 'tokenAddress'
const TASK_PARAM_SPENDER = 'spenderAddress'
const TASK_PARAM_AMOUNT = 'amount'

const approve = R.invoker(2, 'approve')
const attachToAddress = R.invoker(1, 'attach')
const waitTxReceipt = R.invoker(0, 'wait')
const printTxHash = _tx => console.info(`Tx mined @ ${_tx.transactionHash}`)

const erc20Approve = (taskArgs, hre) =>
  Promise.resolve(hre.ethers.getContractFactory('ERC20'))
    .then(attachToAddress(taskArgs[TASK_PARAM_TOKEN_ADDRESS]))
    .then(approve(taskArgs[TASK_PARAM_SPENDER], taskArgs[TASK_PARAM_AMOUNT]))
    .then(waitTxReceipt)
    .then(printTxHash)

task(TASK_NAME_ERC20_APPROVE, TASK_DESC_ERC20_APPROVE, erc20Approve)
  .addPositionalParam(TASK_PARAM_TOKEN_ADDRESS, 'Token address', undefined, types.string)
  .addPositionalParam(
    TASK_PARAM_SPENDER,
    'Address allowed to spend the token on our behalf',
    undefined,
    types.string
  )
  .addPositionalParam(TASK_PARAM_AMOUNT, 'Value to transfer', undefined, types.int)
