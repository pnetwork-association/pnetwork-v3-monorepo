const ethers = require('ethers')
const fetch = require('node-fetch')

const main = async () => {
  try {
    await fetch('https://google.com')
    console.error('Please disconnect from the internet')
    process.exit(1)
  } catch (error) {
    const w = ethers.Wallet.createRandom()
    console.info(w.privateKey)
    console.info(w.address)
  }
  process.exit(0)
}

main()
