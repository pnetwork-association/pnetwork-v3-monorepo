task(
  'pnetwork-deploy-ERC20-token',
  'Deploy a ERC20 token to be used as underlying asset for v3 contracts deployment'
)
  .addPositionalParam('name')
  .addPositionalParam('symbol')
  .addPositionalParam('decimals')
  .addPositionalParam('totalSupply')
  .setAction(async taskArgs => {
    await main(taskArgs)
      // eslint-disable-next-line no-process-exit
      .then(() => process.exit(0))
      .catch(error => {
        console.error(error)
        // eslint-disable-next-line no-process-exit
        process.exit(1)
      })
  })

/* eslint-disable no-console */
const main = async config => {
  const StandardToken = await ethers.getContractFactory('StandardToken')

  console.log('Deploying Token ...')
  const token = await StandardToken.deploy(
    config.name,
    config.symbol,
    config.decimals,
    ethers.utils.parseEther(config.totalSupply)
  )

  console.log({
    token: token.address,
  })
}
