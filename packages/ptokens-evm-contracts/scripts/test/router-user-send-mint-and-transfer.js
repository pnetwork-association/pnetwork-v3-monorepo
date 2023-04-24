/* eslint-disable no-console */
const { ethers } = require('hardhat')
const { PNETWORK_NETWORK_IDS } = require('../config')

const PROUTER_ADDRESS = '0xd0e946BD5BfE7Aa6cfC083028cf958c6B71cCAa0'
const TOKEN_ADDRESS = '0xA2a4F06361C5913F1f2deb7E265EE21a09B8474e'
const PTOKEN_ADDRESS = '0xb08A46F04c683aC0B9D3dE9774e8efc5A5e621b1'

const main = async () => {
  const signer = await ethers.getSigner()
  console.log(signer.address)
  const PRouter = await ethers.getContractFactory('PRouter')
  const ERC20 = await ethers.getContractFactory('ERC20')

  const pRouter = await PRouter.attach(PROUTER_ADDRESS)
  const token = await ERC20.attach(TOKEN_ADDRESS)

  const amount = ethers.utils.parseEther('100')
  console.log('Approving ...')
  await token.approve(PTOKEN_ADDRESS, amount)
  console.log('Generating an UserOperation ...')

  const tx = await pRouter.userSend(
    signer.address,
    PNETWORK_NETWORK_IDS.mumbai,
    await token.name(),
    await token.symbol(),
    await token.decimals(),
    token.address,
    PNETWORK_NETWORK_IDS.sepolia,
    token.address,
    amount,
    '0x',
    '0x'.padEnd(66, '0'),
    {
      gasLimit: 200000,
    }
  )
  await tx.wait(1)
}

main()
  // eslint-disable-next-line no-process-exit
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  })

/* eslint-enable no-console */
