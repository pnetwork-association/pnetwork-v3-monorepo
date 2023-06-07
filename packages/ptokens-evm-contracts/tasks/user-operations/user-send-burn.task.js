const { types } = require('hardhat/config')
const { getConfiguration } = require('../deploy/lib/configuration-manager')
const R = require('ramda')

const {
  KEY_ADDRESS,
  KEY_PROUTER,
  KEY_PTOKEN_LIST,
  KEY_NETWORK_ID,
  KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS,
  KEY_PTOKEN_UNDERLYING_ASSET_NETWORKID,
  PARAM_NAME_PTOKEN_ADDRESS,
  PARAM_DESC_PTOKEN_ADDRESS,
} = require('../constants')

const TASK_NAME_USER_SEND_BURN = 'router:burn'
const TASK_DESC_USER_SEND_BURN = 'Redeem pTokens.'

const getAssetFromPToken = (pTokenAddress, config, hre) => {
  const findPToken = R.find(R.propEq(pTokenAddress, KEY_ADDRESS))
  const pTokens = R.path([hre.network.name, KEY_PTOKEN_LIST], config.get())
  const ptoken = findPToken(pTokens)
  return [
    ptoken[KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS],
    ptoken[KEY_PTOKEN_UNDERLYING_ASSET_NETWORKID],
  ]
}

const burn = async (taskArgs, hre) => {
  const config = await getConfiguration()
  const signer = await hre.ethers.getSigner()
  const PRouter = await hre.ethers.getContractFactory('PRouter')
  const pRouter = await PRouter.attach(config.get(hre.network.name)[KEY_PROUTER][KEY_ADDRESS])

  const [underlyingAssetAddress, underlyingAssetChainName] = getAssetFromPToken(
    taskArgs.pTokenAddress,
    config,
    hre
  )

  const currentChain = hre.network.name
  hre.changeNetwork(underlyingAssetChainName)
  const ERC20 = await hre.ethers.getContractFactory('ERC20')
  const asset = await ERC20.attach(underlyingAssetAddress)
  const underlyingAssetName = await asset.name()
  const underlyingAssetSymbol = await asset.symbol()
  const underlyingAssetDecimals = await asset.decimals()
  hre.changeNetwork(currentChain)

  const destinationNetworkId = config.get(hre.network.name)[KEY_NETWORK_ID]
  const underlyingAssetNetworkId = config.get(underlyingAssetChainName)[KEY_NETWORK_ID]

  console.info(
    `${taskArgs.amount} ptokens ${taskArgs.pTokenAddress} will be burned in order to reedem ${taskArgs.amount} ${underlyingAssetSymbol} (address: ${underlyingAssetAddress})`
  )
  console.info(`Account requesting the reedem: ${signer.address}`)
  const parsedAmount = hre.ethers.utils.parseEther(taskArgs.amount)
  console.info(`Approving ${taskArgs.amount} ptokens from ${taskArgs.pTokenAddress}`) // TODO check if there is a ptoken symbol
  await asset.approve(taskArgs.pTokenAddress, parsedAmount)
  console.info('Generating an UserOperation ...')

  const tx = await pRouter.userSend(
    signer.address,
    destinationNetworkId,
    underlyingAssetName,
    underlyingAssetSymbol,
    underlyingAssetDecimals,
    underlyingAssetAddress,
    underlyingAssetNetworkId,
    taskArgs.pTokenAddress,
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
  .addPositionalParam(PARAM_NAME_PTOKEN_ADDRESS, PARAM_DESC_PTOKEN_ADDRESS, undefined, types.string)
  .addPositionalParam('amount', 'Amount of underlying asset to be used', undefined, types.string)
  .setAction(burn)

module.exports = {
  TASK_NAME_USER_SEND_BURN,
}
