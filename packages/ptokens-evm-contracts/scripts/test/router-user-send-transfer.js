/* eslint-disable no-console */
const { ethers } = require('hardhat')
const { PNETWORK_NETWORK_IDS } = require('../config')

const PROUTER_ADDRESS = '0x69167a44Dd77A4164470362AbCeb1ae2FD57693F'
const TOKEN_ADDRESS = '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9'
const PTOKEN_ADDRESS = '0x7E4F14e4922E54d0a20e8E53465254AC65c54147'

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
    'Token',
    'TKN',
    18,
    TOKEN_ADDRESS,
    PNETWORK_NETWORK_IDS.sepolia,
    PTOKEN_ADDRESS,
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
