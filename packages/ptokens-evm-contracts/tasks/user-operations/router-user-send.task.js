const { types } = require('hardhat/config')
const { getConfiguration } = require('../deploy/lib/configuration-manager')

const {
  KEY_ADDRESS,
  TASK_NAME_USER_SEND,
  TASK_DESC_USER_SEND,
  KEY_NETWORK_ID,
  KEY_PROUTER,
  KEY_PTOKEN_LIST,
  KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS,
} = require('../constants')

const { getUnderlyingAsset } = require('../deploy/deploy-ptoken.task')

const mintAndBurn = async (
  { underlyingAssetAddress, underlyingAssetChainName, pTokenAddress, destinationNetworkId, amount },
  hre
) => {
  const config = await getConfiguration()
  const signer = await hre.ethers.getSigner()
  console.log(signer.address)

  const PRouter = await hre.ethers.getContractFactory('PRouter')
  const ERC20 = await hre.ethers.getContractFactory('ERC20')

  const pRouter = await PRouter.attach(config.get(hre.network.name)[KEY_PROUTER][KEY_ADDRESS])
  const token = await getUnderlyingAsset({'underlyingAssetChainName': underlyingAssetChainName, 'underlyingAssetAddress': underlyingAssetAddress, }, hre)
  const underlyingAssetNetworkId = config.get(underlyingAssetChainName)[KEY_NETWORK_ID]


  const parsedAmount = hre.ethers.utils.parseEther(amount)
  console.log('Approving ...')
  await token.approve(pTokenAddress, parsedAmount)
  console.log('Generating an UserOperation ...')

  console.log(signer.address,
    destinationNetworkId,
    await token.name(),
    await token.symbol(),
    await token.decimals(),
    token.address,
    underlyingAssetNetworkId,
    pTokenAddress,
    parsedAmount,
    '0x',
    '0x'.padEnd(66, '0'),)

  const tx = await pRouter.userSend(
    signer.address,
    destinationNetworkId,
    await token.name(),
    await token.symbol(),
    await token.decimals(),
    token.address,
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

task(TASK_NAME_USER_SEND, TASK_DESC_USER_SEND)
  .addPositionalParam(
    'underlyingAssetAddress',
    'pToken address relative to the underlying asset selected',
    undefined,
    types.string
  )
  .addPositionalParam(
    'underlyingAssetChainName',
    'pToken address relative to the underlying asset selected',
    undefined,
    types.string
  )
  .addPositionalParam(
    'pTokenAddress',
    'pToken address relative to the underlying asset selected',
    undefined,
    types.string
  )
  .addPositionalParam(
    'destinationNetworkId',
    'Destiantion chain name (ex. 11155111, mumbai ...)',
    undefined,
    types.string
  )
  .addPositionalParam('amount', 'Amount of underlying asset to be used', undefined, types.string)
  .setAction(mintAndBurn)

module.exports = {
  TASK_NAME_USER_SEND,
}
