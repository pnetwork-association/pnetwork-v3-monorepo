/**
 * Script to get the address of an EVM
 * account store at the given path
 */
const fs = require('fs')
const R = require('ramda')
const path = require('path')
const { ethers } = require('ethers')
const { execSync } = require('node:child_process')

const main = () => {
  const file = process.argv[2]

  const ext = path.extname(file)

  if (R.isNil(file)) console.error('Please provide the private key path', file) || process.exit(1)
  else {
    const pk =
      ext === '.gpg' ? execSync(`gpg -q -d ${file}`).toString() : fs.readFileSync(file).toString()

    if (R.isNil(file)) {
      console.error('Unable to extract private key') || process.exit(1)
    }

    try {
      const wallet = new ethers.Wallet(pk.trim())
      console.info(wallet.address)
      process.exit(0)
    } catch (e) {
      console.error('Failed to import private key')
      process.exit(1)
    }
  }
}

main()
