const { types } = require('hardhat/config')
const {
  PARAM_NAME_GASPRICE,
  PARAM_NAME_GAS,
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
  getPTokenFromAsset,
  isPToken,
  getUnderlyingAssetTokenAddressForPToken,
  isUnderlyingAssetTokenAddress,
} = require('../lib/configuration-manager')

const TASK_NAME = 'hub:usersend'
const TASK_DESC = 'Swap tokens on pNetwork'

const isDestinationChainDifferent = (hre, _destinationChainName) =>
  hre.network.name !== _destinationChainName

const userSend = async (taskArgs, hre) => {
  const signer = await hre.ethers.getSigner()

  const PNetworkHub = await hre.ethers.getContractFactory('PNetworkHub')
  const hubAddress = await getHubAddress(hre)
  const hub = await PNetworkHub.attach(hubAddress)

  const destinationAccount = taskArgs[PARAM_NAME_DEST_ADDRESS]
  const assetToSwap = taskArgs[PARAM_NAME_ASSET_ADDRESS]
  const destinationChainName = taskArgs[PARAM_NAME_DEST_CHAIN]

  let underlyingAssetTokenAddress = null
  let assetTokenAddress = null

  if (await isUnderlyingAssetTokenAddress(hre, assetToSwap)) {
    underlyingAssetTokenAddress = assetToSwap
    assetTokenAddress = assetToSwap
  } else if (
    (await isPToken(hre, assetToSwap)) &&
    isDestinationChainDifferent(hre, destinationChainName)
  ) {
    underlyingAssetTokenAddress = getUnderlyingAssetTokenAddressForPToken(hre, assetToSwap)
    assetTokenAddress = assetToSwap
  } else {
    throw new Error(
      `Invalid Swap: either the pToken '${assetToSwap}' doesn't exist in the deployments.json file or the given pToken is belonging to the given destination chain name.`
    )
  }

  const underlyingAssetToken = await hre.ethers.getContractAt('ERC20', underlyingAssetTokenAddress)
  const underlyingAssetName = await underlyingAssetToken.name()
  const underlyingAssetSymbol = await underlyingAssetToken.symbol()
  const underlyingAssetDecimals = await underlyingAssetToken.decimals()
  const underlyingAssetNetworkId = await getNetworkId(hre)
  const parsedAmount = hre.ethers.utils.parseUnits(
    taskArgs[PARAM_NAME_AMOUNT],
    underlyingAssetDecimals
  )
  const userData = '0x'
  const optionsMask = '0x'.padEnd(66, '0')
  const networkFeeAssetAmount = 1000
  const forwardNetworkFeeAssetAmount = 2000

  console.log('Selected signer: ', signer.address)
  console.log('Underlying asset address: ', underlyingAssetTokenAddress)
  console.log('Asset token address', assetTokenAddress)
  console.log('Destination chain:', destinationChainName)

  if (taskArgs.approve) {
    const pTokenAddress = await getPTokenFromAsset(hre, underlyingAssetTokenAddress)
    console.log(`pToken address to approve for: ${pTokenAddress}`)
    console.log(
      `Approving ${parsedAmount} from ${underlyingAssetTokenAddress} for ${pTokenAddress}...`
    )
    await underlyingAssetToken.approve(pTokenAddress, parsedAmount)
  }

  const destinationNetworkId = await getNetworkIdFromChainName(destinationChainName)

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
  .addPositionalParam(PARAM_NAME_ASSET_ADDRESS, PARAM_DESC_ASSET_ADDRESS, undefined, types.string)
  .addPositionalParam(PARAM_NAME_DEST_CHAIN, PARAM_DESC_DEST_CHAIN, undefined, types.string)
  .addPositionalParam(PARAM_NAME_DEST_ADDRESS, PARAM_DESC_DEST_ADDRESS, undefined, types.string)
  .addPositionalParam(PARAM_NAME_AMOUNT, PARAM_DESC_AMOUNT, undefined, types.string)
  .addFlag(OPT_NAME_APPROVE, OPT_DESC_APPROVE)
  .setAction(userSend)

module.exports = {
  TASK_NAME,
}
