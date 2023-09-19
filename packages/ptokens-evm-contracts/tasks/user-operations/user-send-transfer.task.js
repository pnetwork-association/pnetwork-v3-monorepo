const { types } = require('hardhat/config')
const { getOptionMaskWithOptionEnabledForBit } = require('../../test/utils/index')
const {
  getPRouterAddress,
  getDeploymentFromHRE,
  getNetworkIdFromChainName,
  getDeploymentFromNetworkName,
} = require('../lib/configuration-manager')
const R = require('ramda')
const TASK_CONSTANTS = require('../constants')

const TASK_NAME = 'router:transfer'
const TASK_DESC = 'Move pTokens form a chain to another one.'

const getPTokenConfiguration = (taskArgs, hre) =>
  getDeploymentFromHRE(hre)
    .then(R.prop(TASK_CONSTANTS.KEY_PTOKEN_LIST))
    .then(
      R.find(
        R.propEq(taskArgs[TASK_CONSTANTS.PARAM_NAME_PTOKEN_ADDRESS], TASK_CONSTANTS.KEY_ADDRESS)
      )
    )

const getUnderlyingAssetConfiguration = (taskArgs, hre, pTokenConfiguration) =>
  Promise.resolve(pTokenConfiguration[TASK_CONSTANTS.KEY_PTOKEN_UNDERLYING_ASSET_NETWORKID])
    .then(getDeploymentFromNetworkName)
    .then(R.prop(TASK_CONSTANTS.KEY_UNDERLYING_ASSET_LIST))
    .then(
      R.find(
        R.propEq(
          pTokenConfiguration[TASK_CONSTANTS.KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS],
          TASK_CONSTANTS.KEY_ADDRESS
        )
      )
    )

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

  const pTokenAddress = pTokenConfiguration[TASK_CONSTANTS.KEY_ADDRESS]
  const pTokenFactory = await hre.ethers.getContractFactory('PToken')
  const pToken = await pTokenFactory.attach(pTokenAddress)
  const pTokenDecimals = await pToken.decimals()
  console.log('Signer is:', signer.address)

  const destinationAddress = taskArgs[TASK_CONSTANTS.PARAM_NAME_DEST_ADDRESS]
  const destinationNetworkId = await getNetworkIdFromChainName(
    taskArgs[TASK_CONSTANTS.PARAM_NAME_DEST_CHAIN]
  )
  const underlyingAssetName = underlyingAssetConfiguration[TASK_CONSTANTS.KEY_ASSET_NAME]
  const underlyingAssetSymbol = underlyingAssetConfiguration[TASK_CONSTANTS.KEY_ASSET_SYMBOL]
  const underlyingAssetDecimals = underlyingAssetConfiguration[TASK_CONSTANTS.KEY_ASSET_DECIMALS]
  const underlyingAssetAddress = underlyingAssetConfiguration[TASK_CONSTANTS.KEY_ADDRESS]
  const underlyingAssetNetworkId = await getNetworkIdFromChainName(
    pTokenConfiguration[TASK_CONSTANTS.KEY_PTOKEN_UNDERLYING_ASSET_NETWORKID]
  )
  const parsedAmount = hre.ethers.utils.parseUnits(
    taskArgs[TASK_CONSTANTS.PARAM_NAME_AMOUNT],
    pTokenDecimals
  )
  const optionsMask = getOptionMaskWithOptionEnabledForBit(0)

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
    optionsMask,
    {
      gasPrice: taskArgs[TASK_CONSTANTS.PARAM_NAME_GASPRICE],
      gasLimit: taskArgs[TASK_CONSTANTS.PARAM_NAME_GAS],
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
    TASK_CONSTANTS.PARAM_NAME_PTOKEN_ADDRESS,
    TASK_CONSTANTS.PARAM_DESC_PTOKEN_ADDRESS,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_DEST_CHAIN,
    TASK_CONSTANTS.PARAM_DESC_DEST_CHAIN,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_DEST_ADDRESS,
    TASK_CONSTANTS.PARAM_DESC_DEST_ADDRESS,
    undefined,
    types.string
  )
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_AMOUNT,
    TASK_CONSTANTS.PARAM_DESC_DEST_ADDRESS,
    undefined,
    types.string
  )
  .setAction(transfer)

module.exports = {
  TASK_NAME,
}
