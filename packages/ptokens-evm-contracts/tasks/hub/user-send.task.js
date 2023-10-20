const { types } = require('hardhat/config')
const R = require('ramda')
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
  FLAG_NAME_APPROVE,
  FLAG_DESC_APPROVE,
  KEY_ADDRESS,
  KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS,
  KEY_PTOKEN_UNDERLYING_ASSET_CHAIN_NAME,
} = require('../constants')
const {
  getHubAddress,
  getNetworkIdFromChainName,
  getPTokenEntryFromPTokenAddress,
  getPTokenEntryFromUnderlyingAssetAddress,
} = require('../lib/configuration-manager')

const TASK_NAME = 'hub:usersend'
const TASK_DESC = 'Swap tokens on pNetwork'

const userSend = async (taskArgs, hre) => {
  const signer = await hre.ethers.getSigner()

  const PNetworkHub = await hre.ethers.getContractFactory('PNetworkHub')
  const hubAddress = await getHubAddress(hre)
  const hub = await PNetworkHub.attach(hubAddress)

  const amount = taskArgs[PARAM_NAME_AMOUNT]
  const gasLimit = taskArgs[PARAM_NAME_GAS]
  const gasPrice = taskArgs[PARAM_NAME_GASPRICE]
  const assetToSwapAddress = taskArgs[PARAM_NAME_ASSET_ADDRESS]
  const destinationAccount = taskArgs[PARAM_NAME_DEST_ADDRESS]
  const destinationChainName = taskArgs[PARAM_NAME_DEST_CHAIN]

  const pTokenEntry = await getPTokenEntryFromPTokenAddress(hre, assetToSwapAddress).catch(_ =>
    getPTokenEntryFromUnderlyingAssetAddress(hre, assetToSwapAddress)
  )

  const pTokenAddress = pTokenEntry[KEY_ADDRESS]
  const underlyingAssetAddress = pTokenEntry[KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS]
  const destinationNetworkId = await getNetworkIdFromChainName(destinationChainName)

  console.log('Selected signer: ', signer.address)
  console.log('Underlying asset address: ', underlyingAssetAddress)
  console.log('Asset token address', assetToSwapAddress)
  console.log('Destination chain:', destinationChainName)

  const selectedNetwork = hre.network.name
  const underlyingAssetChainName = pTokenEntry[KEY_PTOKEN_UNDERLYING_ASSET_CHAIN_NAME]
  await hre.changeNetwork(underlyingAssetChainName)
  const underlyingAsset = await hre.ethers.getContractAt('ERC20', underlyingAssetAddress)
  const underlyingAssetName = await underlyingAsset.name()
  const underlyingAssetSymbol = await underlyingAsset.symbol()
  const underlyingAssetDecimals = await underlyingAsset.decimals()
  await hre.changeNetwork(selectedNetwork)

  const underlyingAssetNetworkId = await getNetworkIdFromChainName(underlyingAssetChainName)
  const parsedAmount = hre.ethers.utils.parseUnits(amount, underlyingAssetDecimals)
  const userData = '0x'
  const optionsMask = '0x'.padEnd(66, '0')
  const networkFeeAssetAmount = 1000
  const forwardNetworkFeeAssetAmount = 2000

  if (taskArgs[FLAG_NAME_APPROVE]) {
    if (R.toLower(assetToSwapAddress) === R.toLower(underlyingAssetAddress)) {
      console.log(`pToken address to approve for: ${pTokenAddress}`)
      console.log(`Approving ${parsedAmount} from ${assetToSwapAddress} for ${pTokenAddress}...`)
      await underlyingAsset.approve(pTokenAddress, parsedAmount)
    } else {
      console.warn('Approval not needed...')
    }
  }

  const tx = await hub.userSend(
    destinationAccount,
    destinationNetworkId,
    underlyingAssetName,
    underlyingAssetSymbol,
    underlyingAssetDecimals,
    underlyingAssetAddress,
    underlyingAssetNetworkId,
    assetToSwapAddress,
    parsedAmount,
    networkFeeAssetAmount,
    forwardNetworkFeeAssetAmount,
    userData,
    optionsMask,
    { gasPrice, gasLimit }
  )

  const receipt = await tx.wait(1)
  console.info(`Tx mined @ ${receipt.transactionHash}`)
}

task(TASK_NAME, TASK_DESC)
  .addPositionalParam(PARAM_NAME_ASSET_ADDRESS, PARAM_DESC_ASSET_ADDRESS, undefined, types.string)
  .addPositionalParam(PARAM_NAME_DEST_CHAIN, PARAM_DESC_DEST_CHAIN, undefined, types.string)
  .addPositionalParam(PARAM_NAME_DEST_ADDRESS, PARAM_DESC_DEST_ADDRESS, undefined, types.string)
  .addPositionalParam(PARAM_NAME_AMOUNT, PARAM_DESC_AMOUNT, undefined, types.string)
  .addFlag(FLAG_NAME_APPROVE, FLAG_DESC_APPROVE)
  .setAction(userSend)

module.exports = {
  TASK_NAME,
}
