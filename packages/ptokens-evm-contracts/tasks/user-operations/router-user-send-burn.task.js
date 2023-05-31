const { types } = require('hardhat/config')
const { getConfiguration } = require('../deploy/lib/configuration-manager')
const R = require('ramda')

const {
  KEY_ADDRESS,
  TASK_NAME_USER_SEND_BURN,
  TASK_DESC_USER_SEND_BURN,
  KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS,
  KEY_PTOKEN_UNDERLYING_ASSET_NETWORKID,
  KEY_PROUTER,
  KEY_PTOKEN_LIST,
  KEY_NETWORK_ID,
} = require('../constants')

const getAssetFromPToken = (pTokenAddress, config, hre) => {
  const findPToken = R.find(R.propEq(pTokenAddress, KEY_ADDRESS))
  const findAssetAddress = R.path([KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS])
  const getAssetNetworkId = R.path([KEY_PTOKEN_UNDERLYING_ASSET_NETWORKID])
  const pTokens = R.path([hre.network.name, KEY_PTOKEN_LIST], config.get())
  const [assetAddress, AssetNetworkId] = R.pipe(
    findPToken,
    R.juxt([findAssetAddress, getAssetNetworkId])
  )(pTokens)
  return [assetAddress, AssetNetworkId]
}

const burn = async ({ pTokenAddress, amount }, hre) => {
  const config = await getConfiguration()
  const signer = await hre.ethers.getSigner()
  console.log(signer.address)

  const PRouter = await hre.ethers.getContractFactory('PRouter')
  const ERC20 = await hre.ethers.getContractFactory('ERC20')

  const pRouter = await PRouter.attach(config.get(hre.network.name)[KEY_PROUTER][KEY_ADDRESS])

  const { underlyingAssetAddress, underlyingAssetChainName } = getAssetFromPToken(
    pTokenAddress,
    config,
    hre
  )
  const currentChain = hre.network.name
  hre.changeNetwork(underlyingAssetChainName)
  const asset = await ERC20.attach(underlyingAssetAddress)
  const underlyingAssetName = await asset.name()
  const underlyingAssetSymbol = await asset.symbol()
  const underlyingAssetDecimals = await asset.decimals()
  hre.changeNetwork(currentChain)

  const destinationNetworkId = config.get(hre.network.name)[KEY_NETWORK_ID]
  const underlyingAssetNetworkId = config.get(underlyingAssetChainName)[KEY_NETWORK_ID]

  const parsedAmount = hre.ethers.utils.parseEther(amount)
  console.log('Approving ...')
  await asset.approve(pTokenAddress, parsedAmount)
  console.log('Generating an UserOperation ...')

  const tx = await pRouter.userSend(
    signer.address,
    destinationNetworkId,
    underlyingAssetName,
    underlyingAssetSymbol,
    underlyingAssetDecimals,
    underlyingAssetAddress,
    underlyingAssetNetworkId,
    pTokenAddress,
    parsedAmount,
    '0x',
    '0x'.padEnd(66, '0'),
    {
      gasLimit: 200000,
    }
  )
  await tx.wait(1)
}

task(TASK_NAME_USER_SEND_BURN, TASK_DESC_USER_SEND_BURN)
  .addPositionalParam(
    'pTokenAddress',
    'Address of the pTokens to be redeemed',
    undefined,
    types.string
  )
  .addPositionalParam('amount', 'Amount of underlying asset to be used', undefined, types.string)
  .setAction(burn)

module.exports = {
  TASK_NAME_USER_SEND_BURN,
}
