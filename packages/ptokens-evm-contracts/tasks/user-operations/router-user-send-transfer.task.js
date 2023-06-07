const { types } = require('hardhat/config')
const { getConfiguration } = require('../deploy/lib/configuration-manager')
const R = require('ramda')

const {
  KEY_ADDRESS,
  KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS,
  KEY_PTOKEN_UNDERLYING_ASSET_NETWORKID,
  KEY_PROUTER,
  KEY_PTOKEN_LIST,
  KEY_NETWORK_ID,
} = require('../constants')

const TASK_NAME_USER_SEND_TRANS = 'user-send:transfer'
const TASK_DESC_USER_SEND_TRANS = 'Move pTokens form a chain to another one.'

const getAssetFromPToken = (pTokenAddress, config, hre) => {
  const findPToken = R.find(R.propEq(pTokenAddress, KEY_ADDRESS))
  const pTokens = R.path([hre.network.name, KEY_PTOKEN_LIST], config.get())
  const ptoken = findPToken(pTokens)
  return [
    ptoken[KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS],
    ptoken[KEY_PTOKEN_UNDERLYING_ASSET_NETWORKID],
  ]
}

const transfer = async (
  { pTokenAddress, destinationChainName, destinationAddress, amount },
  hre
) => {
  const config = await getConfiguration()
  const signer = await hre.ethers.getSigner()
  console.log(signer.address)

  const PRouter = await hre.ethers.getContractFactory('PRouter')
  const pRouter = await PRouter.attach(config.get(hre.network.name)[KEY_PROUTER][KEY_ADDRESS])

  const [underlyingAssetAddress, underlyingAssetChainName] = getAssetFromPToken(
    pTokenAddress,
    config,
    hre
  )

  console.log(underlyingAssetAddress, underlyingAssetChainName)

  const currentChain = hre.network.name
  hre.changeNetwork(underlyingAssetChainName)
  console.log(`Network changed to ${underlyingAssetChainName}`)
  const ERC20 = await hre.ethers.getContractFactory('ERC20')
  const asset = await ERC20.attach(underlyingAssetAddress)
  const underlyingAssetName = await asset.name()
  const underlyingAssetSymbol = await asset.symbol()
  const underlyingAssetDecimals = await asset.decimals()
  hre.changeNetwork(currentChain)

  const destinationNetworkId = config.get(destinationChainName)[KEY_NETWORK_ID]
  const underlyingAssetNetworkId = config.get(underlyingAssetChainName)[KEY_NETWORK_ID]

  const parsedAmount = hre.ethers.utils.parseEther(amount)
  console.log('Approving ...')
  await asset.approve(pTokenAddress, parsedAmount)
  console.log('Generating an UserOperation ...')

  const tx = await pRouter.userSend(
    destinationAddress,
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

task(TASK_NAME_USER_SEND_TRANS, TASK_DESC_USER_SEND_TRANS)
  .addPositionalParam(
    'pTokenAddress',
    'Address of the pTokens to be transferred',
    undefined,
    types.string
  )
  .addPositionalParam(
    'destinationChainName',
    'Destination chain name (ex. mainnet, mumbai ...)',
    undefined,
    types.string
  )
  .addPositionalParam(
    'destinationAddress',
    'The address receiving the tokens on the destination chain',
    undefined,
    types.string
  )
  .addPositionalParam('amount', 'Amount of underlying asset to be used', undefined, types.string)
  .setAction(transfer)

module.exports = {
  TASK_NAME_USER_SEND_TRANS,
}
