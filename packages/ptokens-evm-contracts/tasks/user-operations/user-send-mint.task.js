const { types } = require('hardhat/config')
const R = require('ramda')
const TASK_CONSTANTS = require('../constants')
const {
  getPRouterAddress,
  getNetworkId,
  getNetworkIdFromChainName,
  getDeploymentFromHRE,
} = require('../lib/configuration-manager')

const TASK_NAME = 'router:mint'
const TASK_DESC = 'Mint new pTokens given an asset address.'

const getPTokenFromAsset = (hre, _assetAddress) =>
  getDeploymentFromHRE(hre)
    .then(R.prop(TASK_CONSTANTS.KEY_PTOKEN_LIST))
    .then(R.find(R.propEq(_assetAddress, TASK_CONSTANTS.KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS)))
    .then(R.prop(TASK_CONSTANTS.KEY_ADDRESS))

const mint = async (taskArgs, hre) => {
  const signer = await hre.ethers.getSigner()

  const PRouter = await hre.ethers.getContractFactory('PRouter')
  const pRouterAddress = await getPRouterAddress(hre)
  const pRouter = await PRouter.attach(pRouterAddress)

  const ERC20 = await hre.ethers.getContractFactory('ERC20')
  const underlyingAssetAddress = taskArgs.assetAddress
  const underlyingAsset = await ERC20.attach(underlyingAssetAddress)
  const underlyingAssetName = await underlyingAsset.name()
  const underlyingAssetSymbol = await underlyingAsset.symbol()
  const underlyingAssetDecimals = await underlyingAsset.decimals()
  const underlyingAssetNetworkId = await getNetworkId(hre)
  const pTokenAddress = await getPTokenFromAsset(hre, underlyingAssetAddress)
  const parsedAmount = hre.ethers.utils.parseUnits(taskArgs.amount, underlyingAssetDecimals)
  const userData = '0x'
  const optionsMask = '0x'.padEnd(66, '0')

  console.log('Selected signer: ', signer.address)
  console.log('pToken address found @', pTokenAddress)
  console.log(`Approving ${parsedAmount} from ${underlyingAssetAddress} for ${pTokenAddress}...`)
  await underlyingAsset.approve(pTokenAddress, parsedAmount)

  console.log(`Generating an UserOperation w/ destination to ${taskArgs.destinationChainName}`)

  const destinationNetworkId = await getNetworkIdFromChainName(taskArgs.destinationChainName)

  const tx = await pRouter.userSend(
    taskArgs.destinationAddress,
    destinationNetworkId,
    underlyingAssetName,
    underlyingAssetSymbol,
    underlyingAssetDecimals,
    underlyingAssetAddress,
    underlyingAssetNetworkId,
    underlyingAssetAddress,
    parsedAmount,
    userData,
    optionsMask,
    {
      gasPrice: taskArgs[TASK_CONSTANTS.PARAM_NAME_GASPRICE],
      gasLimit: taskArgs[TASK_CONSTANTS.PARAM_NAME_GAS],
    }
  )
  const receipt = await tx.wait(1)

  console.info(`Tx mined @ ${receipt.transactionHash}`)
}

task(TASK_NAME, TASK_DESC)
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_ASSET_ADDRESS,
    TASK_CONSTANTS.PARAM_DESC_ASSET_ADDRESS,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_DEST_CHAIN,
    TASK_CONSTANTS.PARAM_DESC_DEST_CHAIN,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_DEST_ADDRESS,
    TASK_CONSTANTS.PARAM_DESC_DEST_ADDRESS,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_AMOUNT,
    TASK_CONSTANTS.PARAM_DESC_AMOUNT,
    undefined,
    types.string
  )
  .setAction(mint)

module.exports = {
  TASK_NAME,
}
