const { types } = require('hardhat/config')
const {
  getPRouterAddress,
  getDeploymentFromHRE,
  getNetworkIdFromChainName,
  getDeploymentFromNetworkName,
} = require('../lib/configuration-manager')
const R = require('ramda')
const {
  KEY_ADDRESS,
  KEY_ASSET_NAME,
  KEY_PTOKEN_LIST,
  KEY_ASSET_SYMBOL,
  KEY_ASSET_DECIMALS,
  KEY_UNDERLYING_ASSET_LIST,
  KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS,
  KEY_PTOKEN_UNDERLYING_ASSET_NETWORKID,
  TASK_PARAM_GASPRICE,
  TASK_PARAM_GASLIMIT,
} = require('../constants')

const TASK_NAME = 'router:transfer'
const TASK_DESC = 'Move pTokens form a chain to another one.'
const TASK_PARAM_PTOKEN_ADDRESS = 'pTokenAddress'
const TASK_PARAM_PTOKEN_ADDRESS_DESC = 'PToken address'
const TASK_PARAM_DEST_CHAIN_NAME = 'destinationChainName'
const TASK_PARAM_DEST_CHAIN_NAME_DESC = 'Chain where to send the ptoken to.'
const TASK_PARAM_DEST_ADDRESS = 'destinationAddress'
const TASK_PARAM_DEST_ADDRESS_DESC = 'Address where to send the ptoken to.'
const TASK_PARAM_AMOUNT = 'amount'
const TASK_PARAM_AMOUNT_DESC = 'Amount of underlying asset to be used'

const getPTokenConfiguration = (taskArgs, hre) =>
  getDeploymentFromHRE(hre)
    .then(R.prop(KEY_PTOKEN_LIST))
    .then(R.find(R.propEq(taskArgs[TASK_PARAM_PTOKEN_ADDRESS], KEY_ADDRESS)))

const getUnderlyingAssetConfiguration = (taskArgs, hre, pTokenConfiguration) =>
  Promise.resolve(pTokenConfiguration[KEY_PTOKEN_UNDERLYING_ASSET_NETWORKID])
    .then(getDeploymentFromNetworkName)
    .then(R.prop(KEY_UNDERLYING_ASSET_LIST))
    .then(R.find(R.propEq(pTokenConfiguration[KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS], KEY_ADDRESS)))

const transfer = async (taskArgs, hre) => {
  const pTokenConfiguration = await getPTokenConfiguration(taskArgs, hre)
  console.log('pToken found:', pTokenConfiguration)
  const underlyingAssetConfiguration = await getUnderlyingAssetConfiguration(
    taskArgs,
    hre,
    pTokenConfiguration
  )
  console.log('Underlying asset found:', underlyingAssetConfiguration)

  const signer = await hre.ethers.getSigner()
  const pRouterAddress = await getPRouterAddress(hre)
  const pRouterFactory = await hre.ethers.getContractFactory('PRouter')
  const pRouter = await pRouterFactory.attach(pRouterAddress)

  const pTokenAddress = pTokenConfiguration[KEY_ADDRESS]
  const pTokenFactory = await hre.ethers.getContractFactory('PToken')
  const pToken = await pTokenFactory.attach(pTokenAddress)
  const pTokenDecimals = await pToken.decimals()
  console.log('Signer is:', signer.address)

  const destinationAddress = taskArgs[TASK_PARAM_DEST_ADDRESS]
  const destinationNetworkId = await getNetworkIdFromChainName(taskArgs[TASK_PARAM_DEST_CHAIN_NAME])
  const underlyingAssetName = underlyingAssetConfiguration[KEY_ASSET_NAME]
  const underlyingAssetSymbol = underlyingAssetConfiguration[KEY_ASSET_SYMBOL]
  const underlyingAssetDecimals = underlyingAssetConfiguration[KEY_ASSET_DECIMALS]
  const underlyingAssetAddress = underlyingAssetConfiguration[KEY_ADDRESS]
  const underlyingAssetNetworkId = await getNetworkIdFromChainName(
    pTokenConfiguration[KEY_PTOKEN_UNDERLYING_ASSET_NETWORKID]
  )
  const parsedAmount = hre.ethers.utils.parseUnits(taskArgs[TASK_PARAM_AMOUNT], pTokenDecimals)

  const args = [
    destinationAddress,
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
      gasPrice: taskArgs[TASK_PARAM_GASPRICE],
      gasLimit: taskArgs[TASK_PARAM_GASLIMIT],
    },
  ]

  console.info(args)
  console.log('Transfering tokens...')
  const tx = await pRouter.userSend(...args)

  const receipt = await tx.wait(1)
  console.info(`Tx mined @ ${receipt.transactionHash}`)
}

task(TASK_NAME, TASK_DESC)
  .addPositionalParam(
    TASK_PARAM_PTOKEN_ADDRESS,
    TASK_PARAM_PTOKEN_ADDRESS_DESC,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_PARAM_DEST_CHAIN_NAME,
    TASK_PARAM_DEST_CHAIN_NAME_DESC,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_PARAM_DEST_ADDRESS,
    TASK_PARAM_DEST_ADDRESS_DESC,
    undefined,
    types.string
  )
  .addPositionalParam(TASK_PARAM_AMOUNT, TASK_PARAM_AMOUNT_DESC, undefined, types.string)
  .setAction(transfer)

module.exports = {
  TASK_NAME,
}
