/**
 * Script to get the address of an EVM
 * account store at the given path
 */
const R = require('ramda')
const fs = require('fs')
const { ethers } = require('ethers')

const main = () => {
  const path = process.argv[2]

  if (R.isNil(path)) console.error('Please provide the private key path', path) || process.exit(1)
  else {
    const pk = fs.readFileSync(path).toString()
    const wallet = new ethers.Wallet(pk)

    console.info(wallet.address)
    process.exit(0)
  }
}

main()
