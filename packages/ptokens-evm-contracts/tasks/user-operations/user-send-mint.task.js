const { types } = require('hardhat/config')
const { getConfiguration } = require('../deploy/lib/configuration-manager')
const R = require('ramda')

const {
  KEY_ADDRESS,
  KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS,
  KEY_PROUTER,
  KEY_PTOKEN_LIST,
  KEY_NETWORK_ID,
  PARAM_NAME_DEST_CHAIN,
  PARAM_DESC_DEST_CHAIN,
  PARAM_NAME_DEST_ADDRESS,
  PARAM_DESC_DEST_ADDRESS,
} = require('../constants')

const TASK_NAME_USER_SEND_MINT = 'router:mint'
const TASK_DESC_USER_SEND_MINT = 'Mint new pTokens given an asset address.'

const getPTokenFromAsset = (assetAddress, config, hre) => {
  const findAsset = R.find(R.propEq(assetAddress, KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS))
  const findPTokenAddress = R.path([KEY_ADDRESS])
  const pTokens = R.path([hre.network.name, KEY_PTOKEN_LIST], config.get())
  const pTokenAddress = R.pipe(findAsset, findPTokenAddress)(pTokens)
  return pTokenAddress
}

const mint = async (taskArgs, hre) => {
  const config = await getConfiguration()
  const signer = await hre.ethers.getSigner()
  console.log(signer.address)

  const PRouter = await hre.ethers.getContractFactory('PRouter')
  const ERC20 = await hre.ethers.getContractFactory('ERC20')

  const pRouter = await PRouter.attach(config.get(hre.network.name)[KEY_PROUTER][KEY_ADDRESS])
  const asset = await ERC20.attach(taskArgs.assetAddress)

  const pTokenAddress = getPTokenFromAsset(taskArgs.assetAddress, config, hre)
  const underlyingAssetNetworkId = config.get(hre.network.name)[KEY_NETWORK_ID]
  const destinationNetworkId = config.get(taskArgs.destinationChainName)[KEY_NETWORK_ID]

  const parsedAmount = hre.ethers.utils.parseEther(taskArgs.amount)
  console.log('Approving ...')
  await asset.approve(pTokenAddress, parsedAmount)
  console.log('Generating an UserOperation ...')

  const tx = await pRouter.userSend(
    taskArgs.destinationAddress,
    destinationNetworkId,
    await asset.name(),
    await asset.symbol(),
    await asset.decimals(),
    taskArgs.assetAddress,
    underlyingAssetNetworkId,
    taskArgs.assetAddress,
    parsedAmount,
    '0x',
    '0x'.padEnd(66, '0'),
    {
      gasLimit: 200000,
    }
  )
  await tx.wait(1)
}

task(TASK_NAME_USER_SEND_MINT, TASK_DESC_USER_SEND_MINT)
  .addPositionalParam('assetAddress', 'Underlying asset address', undefined, types.string)
  .addPositionalParam(PARAM_NAME_DEST_CHAIN, PARAM_DESC_DEST_CHAIN, undefined, types.string)
  .addPositionalParam(PARAM_NAME_DEST_ADDRESS, PARAM_DESC_DEST_ADDRESS, undefined, types.string)
  .addPositionalParam('amount', 'Amount of underlying asset to be used', undefined, types.string)
  .setAction(mint)

module.exports = {
  TASK_NAME_USER_SEND_MINT,
}
