/* eslint-disable no-console */
const { ethers } = require('hardhat')
const { PNETWORK_NETWORK_IDS } = require('../config')

const PROUTER_ADDRESS = '0xEFcD9f9eE77A79A6E2536cb3759Ed3c00107a398'
const TOKEN_ADDRESS = '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9'
const PTOKEN_ADDRESS = '0x573c0FFa96cB5a2366fc4ee6837CAecd0C5f13DE'

const main = async () => {
  const signer = await ethers.getSigner()

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
    PNETWORK_NETWORK_IDS.sepolia,
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
