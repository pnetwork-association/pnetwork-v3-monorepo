const { types } = require('hardhat/config')
const { getConfiguration } = require('../lib/configuration-manager')
const R = require('ramda')
const {
  KEY_ADDRESS,
  KEY_PTOKEN_LIST,
  TASK_PARAM_GASPRICE,
  TASK_PARAM_GASLIMIT,
  KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS,
  KEY_PTOKEN_UNDERLYING_ASSET_NETWORKID,
  PARAM_NAME_PTOKEN_ADDRESS,
  PARAM_DESC_PTOKEN_ADDRESS,
} = require('../constants')

const TASK_NAME = 'router:burn'
const TASK_DESC = 'Redeem pTokens.'

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

  const [underlyingAssetAddress] = getAssetFromPToken(taskArgs.pTokenAddress, config, hre)

  const ERC20 = await hre.ethers.getContractFactory('ERC20')
  const asset = await ERC20.attach(underlyingAssetAddress)
  const underlyingAssetSymbol = await asset.symbol()

  const pTokenFactory = await hre.ethers.getContractFactory('PToken')
  const ptoken = await pTokenFactory.attach(taskArgs.pTokenAddress)
  const ptokenSymbol = await ptoken.symbol()

  console.info(
    `${taskArgs.amount} ptokens ${taskArgs.pTokenAddress} will be burned in order to reedem ${taskArgs.amount} ${underlyingAssetSymbol} (address: ${underlyingAssetAddress})`
  )
  console.info(`Account requesting the reedem: ${signer.address}`)
  const parsedAmount = hre.ethers.utils.parseEther(taskArgs.amount)
  await asset.approve(signer.address, parsedAmount)
  console.info(`Redeeming ${taskArgs.amount} ${ptokenSymbol} to address ${signer.address}`)
  const tx = await ptoken.burn(parsedAmount, {
    gasPrice: taskArgs[TASK_PARAM_GASPRICE],
    gasLimit: taskArgs[TASK_PARAM_GASLIMIT],
  })

  await tx.wait(1)
}

task(TASK_NAME, TASK_DESC)
  .addPositionalParam(PARAM_NAME_PTOKEN_ADDRESS, PARAM_DESC_PTOKEN_ADDRESS, undefined, types.string)
  .addPositionalParam('amount', 'Amount of underlying asset to be used', undefined, types.string)
  .setAction(burn)

module.exports = {
  TASK_NAME,
}
