task('pnetwork-user-send', 'Send request to prouter')
  .addPositionalParam('pRouterAddress')
  .addPositionalParam('tokenAddress')
  .addPositionalParam('pTokenAddress')
  .addPositionalParam('underlyingAssetNetworkId')
  .addPositionalParam('destinationNetworkId')
  .addPositionalParam('amount')
  .setAction(async taskArgs => {
    console.log(taskArgs)
    await main(taskArgs)
      // eslint-disable-next-line no-process-exit
      .then(() => process.exit(0))
      .catch(error => {
        console.error(error)
        // eslint-disable-next-line no-process-exit
        process.exit(1)
      })
  })

const main = async config => {
  const signer = await ethers.getSigner()
  console.log(signer.address)
  const PRouter = await ethers.getContractFactory('PRouter')
  const ERC20 = await ethers.getContractFactory('ERC20')

  const pRouter = await PRouter.attach(config.pRouterAddress)
  const token = await ERC20.attach(config.tokenAddress)

  const amount = ethers.utils.parseEther(config.amount)
  console.log('Approving ...')
  await token.approve(config.pTokenAddress, amount)
  console.log('Generating an UserOperation ...')

  const tx = await pRouter.userSend(
    signer.address,
    config.destinationNetworkId,
    await token.name(),
    await token.symbol(),
    await token.decimals(),
    token.address,
    config.underlyingAssetNetworkId,
    config.pTokenAddress,
    amount,
    '0x',
    '0x'.padEnd(66, '0'),
    {
      gasLimit: 200000,
    }
  )
  await tx.wait(1)
}
