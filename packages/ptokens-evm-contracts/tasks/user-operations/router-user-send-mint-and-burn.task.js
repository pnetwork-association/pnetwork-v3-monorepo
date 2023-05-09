const { types } = require('hardhat/config')
const { getConfiguration } = require('../deploy/lib/configuration-manager')
// const { getNetworkId } = require('../get-network-id/get-network-id.task')
const { TASK_NAME_USER_MINT_AND_BURN, TASK_DESC_USER_MINT_AND_BURN, KEY_PROUTER_ADDRESS, KEY_NETWORK_ID } = require('../constants')

const mintAndBurn = async ({ underlyingAssetAddress, pTokenAddress, destinationNetworkId, amount }, hre) => {
  // const destinationNetworkId = await getNetworkId(_destinationChain)
  const config = await getConfiguration()
  const signer = await hre.ethers.getSigner()
  console.log(signer.address)

  const PRouter = await hre.ethers.getContractFactory('PRouter')
  const ERC20 = await hre.ethers.getContractFactory('ERC20')

  const pRouter = await PRouter.attach(config.get(hre.network.name)[KEY_PROUTER_ADDRESS])
  const token = await ERC20.attach(underlyingAssetAddress)

  const parsedAmount = hre.ethers.utils.parseEther(amount)
  console.log('Approving ...')
  await token.approve(pTokenAddress, parsedAmount)
  console.log('Generating an UserOperation ...')

  const tx = await pRouter.userSend(
    signer.address,
    destinationNetworkId,
    await token.name(),
    await token.symbol(),
    await token.decimals(),
    token.address,
    config.get(hre.network.name)[KEY_NETWORK_ID],
    token.address,
    parsedAmount,
    '0x',
    '0x'.padEnd(66, '0'),
    {
      gasLimit: 200000,
    }
  )
  await tx.wait(1)
}

task(TASK_NAME_USER_MINT_AND_BURN, TASK_DESC_USER_MINT_AND_BURN)
  .addPositionalParam('underlyingAssetAddress', 'Underlying Asset Address', undefined, types.string)
  .addPositionalParam('pTokenAddress', 'pToken address relative to the underlying asset selected', undefined, types.string)
  .addPositionalParam('destinationNetworkId', 'Destiantion chain name (ex. 11155111, mumbai ...)', undefined, types.string)
  .addPositionalParam('amount', 'Amount of underlying asset to be used', undefined, types.string)
  .setAction(mintAndBurn)

module.exports = {
  TASK_NAME_USER_MINT_AND_BURN,
}
