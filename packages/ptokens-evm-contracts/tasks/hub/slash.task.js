const { types } = require('hardhat/config')
const { getHubAddress } = require('../lib/configuration-manager')
const { PARAM_NAME_GASPRICE, PARAM_NAME_GAS } = require('../constants')
const constants = require('ptokens-constants')
const TASK_DESC = 'Starts a new challenge'
const TASK_NAME = 'hub:slash'
const PARAM_NAME_CHALLENGE_PENDING_EVENT = 'challengePendingEventReport'
const PARAM_DESC_CHALLENGE_PENDING_EVENT = 'JSON related to the ChallengePending event report'

const slashByChallenge = async (_args, _hre) => {
  const challenger = await _hre.ethers.getSigner()
  console.log('challenger.address:', challenger.address)

  const PNetworkHub = await _hre.ethers.getContractFactory('PNetworkHub')
  const hubAddress = await getHubAddress(_hre)
  console.log('hub.address:', hubAddress)
  const hub = await PNetworkHub.attach(hubAddress)

  const gasLimit = _args[PARAM_NAME_GAS]
  const gasPrice = _args[PARAM_NAME_GASPRICE]
  const challengePendingEvent = JSON.parse(_args[PARAM_NAME_CHALLENGE_PENDING_EVENT])

  const challenge = challengePendingEvent[constants.db.KEY_EVENT_ARGS]

  const tx = await hub.slashByChallenge(...challenge, { gasLimit, gasPrice })

  const receipt = await tx.wait(1)

  console.info(`Tx mined @ ${receipt.transactionHash}`)
}

task(TASK_NAME, TASK_DESC)
  .addPositionalParam(
    PARAM_NAME_CHALLENGE_PENDING_EVENT,
    PARAM_DESC_CHALLENGE_PENDING_EVENT,
    undefined,
    types.string
  )
  .setAction(slashByChallenge)

module.exports = {
  TASK_NAME,
}
