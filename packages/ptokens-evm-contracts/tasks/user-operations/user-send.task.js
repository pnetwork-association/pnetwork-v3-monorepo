const R = require('ramda')
const { types } = require('hardhat/config')
const {
  KEY_PTOKEN_LIST,
  KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS,
  KEY_ADDRESS,
  PARAM_NAME_GASPRICE,
  PARAM_NAME_GAS,
  PARAM_NAME_U_ASSET_ADDRESS,
  PARAM_DESC_U_ASSET_ADDRESS,
  PARAM_NAME_ASSET_ADDRESS,
  PARAM_DESC_ASSET_ADDRESS,
  PARAM_NAME_DEST_CHAIN,
  PARAM_DESC_DEST_CHAIN,
  PARAM_NAME_DEST_ADDRESS,
  PARAM_DESC_DEST_ADDRESS,
  PARAM_NAME_AMOUNT,
  PARAM_DESC_AMOUNT,
  OPT_NAME_APPROVE,
  OPT_DESC_APPROVE,
} = require('../constants')
const {
  getHubAddress,
  getNetworkId,
  getNetworkIdFromChainName,
  getDeploymentFromHRE,
} = require('../lib/configuration-manager')

const TASK_NAME = 'hub:usersend'
const TASK_DESC = 'Mint new pTokens given an asset address.'

const getPTokenFromAsset = (hre, _assetAddress) =>
  getDeploymentFromHRE(hre)
    .then(R.prop(KEY_PTOKEN_LIST))
    .then(R.find(R.propEq(_assetAddress, KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS)))
    .then(R.prop(KEY_ADDRESS))

const mint = async (taskArgs, hre) => {
  const signer = await hre.ethers.getSigner()

  const PNetworkHub = await hre.ethers.getContractFactory('PNetworkHub')
  const hubAddress = await getHubAddress(hre)
  const hub = await PNetworkHub.attach(hubAddress)

  const ERC20 = await hre.ethers.getContractFactory('ERC20')
  const destinationAccount = taskArgs[PARAM_NAME_DEST_ADDRESS]
  const underlyingAssetTokenAddress = taskArgs[PARAM_NAME_U_ASSET_ADDRESS]
  const underlyingAssetToken = await ERC20.attach(underlyingAssetTokenAddress)
  const underlyingAssetName = await underlyingAssetToken.name()
  const underlyingAssetSymbol = await underlyingAssetToken.symbol()
  const underlyingAssetDecimals = await underlyingAssetToken.decimals()
  const underlyingAssetNetworkId = await getNetworkId(hre)
  const assetTokenAddress = taskArgs[PARAM_NAME_ASSET_ADDRESS]
  const parsedAmount = hre.ethers.utils.parseUnits(
    taskArgs[PARAM_NAME_AMOUNT],
    underlyingAssetDecimals
  )
  const userData = '0x'
  const optionsMask = '0x'.padEnd(66, '0')
  const networkFeeAssetAmount = 1000
  const forwardNetworkFeeAssetAmount = 2000

  console.log('Selected signer: ', signer.address)
  console.log('Underlying asset selected: ', underlyingAssetTokenAddress)
  console.log('Asset address', assetTokenAddress)

  if (taskArgs.approve) {
    const pTokenAddress = getPTokenFromAsset(hre, underlyingAssetTokenAddress)
    console.log(`pToken address to approve for: ${pTokenAddress}`)
    console.log(
      `Approving ${parsedAmount} from ${underlyingAssetTokenAddress} for ${pTokenAddress}...`
    )
    await underlyingAssetTokenAddress.approve(pTokenAddress, parsedAmount)
  }

  console.log(
    `Generating an UserOperation w/ destination ${destinationAccount} on ${taskArgs[PARAM_NAME_DEST_CHAIN]}`
  )

  const destinationNetworkId = await getNetworkIdFromChainName(taskArgs[PARAM_NAME_DEST_CHAIN])

  const options = {
    gasPrice: taskArgs[PARAM_NAME_GASPRICE],
    gasLimit: taskArgs[PARAM_NAME_GAS],
  }
  const tx = await hub.userSend(
    destinationAccount,
    destinationNetworkId,
    underlyingAssetName,
    underlyingAssetSymbol,
    underlyingAssetDecimals,
    underlyingAssetTokenAddress,
    underlyingAssetNetworkId,
    assetTokenAddress,
    parsedAmount,
    networkFeeAssetAmount,
    forwardNetworkFeeAssetAmount,
    userData,
    optionsMask,
    options
  )

  const receipt = await tx.wait(1)

  console.info(`Tx mined @ ${receipt.transactionHash}`)
}

task(TASK_NAME, TASK_DESC)
  .addPositionalParam(
    PARAM_NAME_U_ASSET_ADDRESS,
    PARAM_DESC_U_ASSET_ADDRESS,
    undefined,
    types.string
  )
  .addPositionalParam(PARAM_NAME_ASSET_ADDRESS, PARAM_DESC_ASSET_ADDRESS, undefined, types.string)
  .addPositionalParam(PARAM_NAME_DEST_CHAIN, PARAM_DESC_DEST_CHAIN, undefined, types.string)
  .addPositionalParam(PARAM_NAME_DEST_ADDRESS, PARAM_DESC_DEST_ADDRESS, undefined, types.string)
  .addPositionalParam(PARAM_NAME_AMOUNT, PARAM_DESC_AMOUNT, undefined, types.string)
  .addOptionalParam(OPT_NAME_APPROVE, OPT_DESC_APPROVE, false, types.boolean)
  .setAction(mint)

module.exports = {
  TASK_NAME,
}
