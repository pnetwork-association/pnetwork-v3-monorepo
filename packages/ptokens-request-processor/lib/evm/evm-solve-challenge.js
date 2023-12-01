const R = require('ramda')
const ethers = require('ethers')
const { logic, utils } = require('ptokens-utils')
const constants = require('ptokens-constants')
const { getMerkleProof } = require('./get-merkle-proof')
const { ERROR_INVALID_PRIVATE_KEY } = require('../errors')
const { STATE_PENDING_CHALLENGES, STATE_DISMISSED_DB_REPORTS } = require('../state/constants')
const { logger } = require('../get-logger')

const abi = require('./abi/PNetworkHub')

const parseChallengeEventArgs = _report => _report[constants.db.KEY_EVENT_ARGS][0]

const sendSolveChallengeTransactions = R.curry(
  async (_pendingChallenges, _hub, _wallet, _txTimeout, _proof) => {
    const contract = new ethers.Contract(_hub, abi, _wallet)

    const broadcasted = []
    for (let i = 0; i < _pendingChallenges.length; i++) {
      const report = _pendingChallenges[i]
      // TODO: return the Challenge struct as done in ptokens-evm-contracts
      const challenge = parseChallengeEventArgs(report)
      const actorAddress = challenge[1]

      // Check challenge address is equal to mine
      if (actorAddress === _wallet.address) {
        const abiCoder = new ethers.AbiCoder()
        const id = ethers.sha256(
          abiCoder.encode(['tuple(uint256,address,address,uint8, uint64,bytes4)'], [challenge])
        )
        const signature = _wallet.signMessage(ethers.getBytes(id))
        const tx = await contract.solveChallenge(
          challenge,
          constants.hub.actors.Guardian,
          _proof,
          signature
        )
        let receipt = null
        try {
          receipt = await tx.wait()
        } catch (error) {
          logger.error(`Failed to broadcast challenge ${report[constants.db.KEY_ID]}!`)
          logger.error(error)
          continue
        }
        logger.info(`Tx mined successfully: ${receipt.hash}`)
        await logic.sleepForXMilliseconds(1000) // TODO: make configurable

        broadcasted.push({
          ...report,
          [constants.db.KEY_FINAL_TX_HASH]: receipt.hash,
          [constants.db.KEY_FINAL_TX_TS]: new Date().toISOString(),
          [constants.db.KEY_STATUS]: constants.db.txStatus.SOLVED,
        })
      }
    }

    logger.info(`Broadcasted ${broadcasted.length} challenges!`)

    return broadcasted
  }
)

const addSolvedChallengesToDismissedReportsInState = R.curry((_state, _solvedChallenges) => {
  logger.info('Adding solved challenges to dismissed reports in state...')
  const dismissedReports = _state[STATE_DISMISSED_DB_REPORTS] || []

  const all = R.concat(dismissedReports, _solvedChallenges)

  return Promise.resolve(R.assoc(STATE_DISMISSED_DB_REPORTS, all, _state))
})

module.exports.maybeSolveChallengesAndPutInState = _state =>
  new Promise((resolve, reject) => {
    const pendingChallenges = _state[STATE_PENDING_CHALLENGES] || []
    const providerUrl = _state[constants.state.KEY_PROVIDER_URL]
    const identityGpgFile = _state[constants.state.KEY_IDENTITY_FILE]
    const provider = new ethers.JsonRpcProvider(providerUrl)
    const db = _state[constants.state.KEY_DB]
    const txTimeout = _state[constants.state.KEY_TX_TIMEOUT]
    const hub = _state[constants.state.KEY_HUB_ADDRESS]

    let privateKey = null
    try {
      privateKey = utils.readIdentityFileSync(identityGpgFile)
    } catch (error) {
      return reject(error)
    }

    if (R.isNil(privateKey)) return reject(new Error(ERROR_INVALID_PRIVATE_KEY))

    const wallet = new ethers.Wallet(privateKey, provider)

    logger.info(`Solving all pending challenges pertaining '${wallet.address}'`)
    return pendingChallenges.length === 0
      ? logger.info('No challenges found ∴ continuing...') || resolve(_state)
      : logger.info('Challenges found!') ||
          getMerkleProof(db, wallet.address)
            .then(sendSolveChallengeTransactions(pendingChallenges, hub, wallet, txTimeout))
            .then(addSolvedChallengesToDismissedReportsInState(_state))
            .then(resolve)
            .then(reject)
  })
