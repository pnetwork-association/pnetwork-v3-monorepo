const R = require('ramda')
const { types } = require('hardhat/config')

const TASK_NAME_ERC20_BALANCE_OF = 'erc20:balanceOf'
const TASK_DESC_ERC20_BALANCE_OF = 'Get the balance for a given address for the specified token'
const TASK_PARAM_TOKEN_ADDRESS = 'tokenAddress'
const TASK_PARAM_OWNER_ADDRESS = 'ownerAddress'

const attachToAddress = R.invoker(1, 'attach')
const balanceOf = R.invoker(1, 'balanceOf')
const printEthers = _ethers => console.info(`${_ethers} ETH`)

const erc20BalanceOfTask = (taskArgs, hre) =>
  Promise.resolve(hre.ethers.getContractFactory('ERC20'))
    .then(attachToAddress(taskArgs[TASK_PARAM_TOKEN_ADDRESS]))
    .then(balanceOf(taskArgs[TASK_PARAM_OWNER_ADDRESS]))
    .then(hre.ethers.utils.formatEther)
    .then(printEthers)

task(TASK_NAME_ERC20_BALANCE_OF, TASK_DESC_ERC20_BALANCE_OF, erc20BalanceOfTask)
  .addPositionalParam(TASK_PARAM_TOKEN_ADDRESS, 'Token address', undefined, types.string)
  .addPositionalParam(
    TASK_PARAM_OWNER_ADDRESS,
    'Address we want to know the balance of (Owner)',
    undefined,
    types.string
  )
