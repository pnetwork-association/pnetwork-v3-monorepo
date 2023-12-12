const { types } = require('hardhat/config')
const constants = require('ptokens-constants')
const {
  PARAM_NAME_DEST_CHAIN,
  PARAM_DESC_DEST_CHAIN,
  PARAM_NAME_DEST_ADDRESS,
  PARAM_DESC_DEST_ADDRESS,
  PARAM_NAME_USERDATA,
  PARAM_DESC_USERDATA,
  FLAG_NAME_APPROVE,
  FLAG_DESC_APPROVE,
  KEY_ADDRESS,
} = require('../constants')
const {
  getHubAddress,
  getNetworkIdFromChainName,
  getPTokenEntryFromUnderlyingAssetAddress,
} = require('../lib/configuration-manager')

const TASK_NAME = 'test:message-passing'
const TASK_DESC = 'Should test message passing'
const messagePassingTestTask = async (_args, _hre) => {
  const destination = _args[PARAM_NAME_DEST_CHAIN]
  const hubAddress = await getHubAddress(_hre)
  const DAIAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
  const DAIPTokenEntry = await getPTokenEntryFromUnderlyingAssetAddress(_hre, DAIAddress)
  const pDAIAddress = DAIPTokenEntry[KEY_ADDRESS]
  const DAI = await _hre.ethers.getContractAt('ERC20', DAIAddress)

  const destinationNetworkId = await getNetworkIdFromChainName(destination)
  const destinationAccount = _args[PARAM_NAME_DEST_ADDRESS] // '0x2B41370C759bC2b1d3cA07aF7e4e9f08e3b544d0'
  const underlyingAssetName = await DAI.name()
  const underlyingAssetSymbol = await DAI.symbol()
  const underlyingAssetDecimals = await DAI.decimals()
  const underlyingAssetTokenAddress = DAI.address
  const underlyingAssetNetworkId = constants.networkIds.ETHEREUM_MAINNET
  const assetTokenAddress = DAI.address
  const assetAmount = 200
  const networkFeeAssetAmount = 100
  const forwardNetworkFeeAssetAmount = 100
  const optionsMask = '0x'.padEnd(66, '0')
  const userData = _args[PARAM_NAME_USERDATA]

  const PNetworkHub = await _hre.ethers.getContractFactory('PNetworkHub')
  const hub = await PNetworkHub.attach(hubAddress)

  const fees = 1 // TODO: set value once userData fee are defined
  const originNetworkId = await getNetworkIdFromChainName(_hre.network.name)
  if (_args[FLAG_NAME_APPROVE] && originNetworkId === constants.networkIds.ETHEREUM_MAINNET) {
    const tx = await DAI.approve(pDAIAddress, fees + assetAmount)
    const rec = await tx.wait(1)

    console.log(`DAI approved @ ${rec.transactionHash}`)
  }

  const tx = await hub.userSend(
    destinationAccount,
    destinationNetworkId,
    underlyingAssetName,
    underlyingAssetSymbol,
    underlyingAssetDecimals,
    underlyingAssetTokenAddress,
    underlyingAssetNetworkId,
    assetTokenAddress,
    assetAmount,
    networkFeeAssetAmount,
    forwardNetworkFeeAssetAmount,
    userData,
    optionsMask
  )

  const receipt = await tx.wait(1)

  console.log(`UserSend @ ${receipt.transactionHash}`)
}

task(TASK_NAME, TASK_DESC)
  .addPositionalParam(PARAM_NAME_DEST_CHAIN, PARAM_DESC_DEST_CHAIN, undefined, types.string)
  .addPositionalParam(PARAM_NAME_DEST_ADDRESS, PARAM_DESC_DEST_ADDRESS, undefined, types.string)
  .addPositionalParam(PARAM_NAME_USERDATA, PARAM_DESC_USERDATA, undefined, types.string)
  .addFlag(FLAG_NAME_APPROVE, FLAG_DESC_APPROVE)
  .setAction(messagePassingTestTask)

module.exports = {
  TASK_NAME,
}
