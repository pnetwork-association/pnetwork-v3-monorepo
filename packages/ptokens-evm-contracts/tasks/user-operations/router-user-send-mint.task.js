const { types } = require('hardhat/config')
const { getConfiguration } = require('../deploy/lib/configuration-manager')
const R = require('ramda')

const {
  KEY_ADDRESS,
  TASK_NAME_USER_SEND_MINT,
  TASK_DESC_USER_SEND_MINT,
  KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS,
  KEY_PROUTER,
  KEY_PTOKEN_LIST,
  KEY_NETWORK_ID,
} = require('../constants')

const getPTokenFromAsset = (assetAddress, config, hre) => {
  const findAsset = R.find(R.propEq(assetAddress, KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS))
  const findPTokenAddress = R.path([KEY_ADDRESS])
  const pTokens = R.path([hre.network.name, KEY_PTOKEN_LIST], config.get())
  const pTokenAddress = R.pipe(findAsset, findPTokenAddress)(pTokens)
  return pTokenAddress
}

const mint = async ({ assetAddress, destinationChainName, amount }, hre) => {
  const config = await getConfiguration()
  const signer = await hre.ethers.getSigner()
  console.log(signer.address)

  const PRouter = await hre.ethers.getContractFactory('PRouter')
  const ERC20 = await hre.ethers.getContractFactory('ERC20')

  const pRouter = await PRouter.attach(config.get(hre.network.name)[KEY_PROUTER][KEY_ADDRESS])
  const asset = await ERC20.attach(assetAddress)

  const pTokenAddress = getPTokenFromAsset(assetAddress, config, hre)
  const underlyingAssetNetworkId = config.get(hre.network.name)[KEY_NETWORK_ID]
  const destinationNetworkId = config.get(destinationChainName)[KEY_NETWORK_ID]

  const parsedAmount = hre.ethers.utils.parseEther(amount)
  console.log('Approving ...')
  await asset.approve(pTokenAddress, parsedAmount)
  console.log('Generating an UserOperation ...')

  const tx = await pRouter.userSend(
    signer.address,
    destinationNetworkId,
    await asset.name(),
    await asset.symbol(),
    await asset.decimals(),
    assetAddress,
    underlyingAssetNetworkId,
    assetAddress,
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
  .addPositionalParam(
    'assetAddress',
    'pToken address relative to the underlying asset selected',
    undefined,
    types.string
  )
  .addPositionalParam(
    'destinationChainName',
    'Destiantion chain name (ex. mainnet, mumbai ...)',
    undefined,
    types.string
  )
  .addPositionalParam('amount', 'Amount of underlying asset to be used', undefined, types.string)
  .setAction(mint)

module.exports = {
  TASK_NAME_USER_SEND_MINT,
}
