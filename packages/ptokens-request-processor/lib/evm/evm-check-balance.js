const R = require('ramda')
const errors = require('../errors')
const ethers = require('ethers')
const constants = require('ptokens-constants')
const { logger } = require('../get-logger')
const { utils } = require('ptokens-utils')

module.exports.checkBalance = _state =>
  new Promise((resolve, reject) => {
    const identityGpgFile = _state[constants.state.KEY_IDENTITY_FILE]
    const providerUrl = _state[constants.state.KEY_PROVIDER_URL]
    // TODO: provider to ptokens-utils (?) and memoize
    const provider = new ethers.JsonRpcProvider(providerUrl)
    const balanceThreshold = ethers.parseEther(_state[constants.state.KEY_BALANCE_THRESHOLD])

    // TODO: evm-solve-challenge.maybeSolveChallengesAndPutInState duplicate
    const privateKey = utils.readIdentityFileSync(identityGpgFile)

    if (R.isNil(privateKey)) return reject(new Error(errors.ERROR_INVALID_PRIVATE_KEY))

    const wallet = new ethers.Wallet(privateKey, provider)

    logger.info('Checking for EVM balance...')
    return provider
      .getBalance(wallet.address)
      .then(balance =>
        R.gte(balance, balanceThreshold)
          ? resolve(_state)
          : reject(
              new Error(
                `${errors.ERROR_INSUFFICIENT_FUNDS}: ${wallet.address}, ${balance} < ${balanceThreshold}`
              )
            )
      )
  })
