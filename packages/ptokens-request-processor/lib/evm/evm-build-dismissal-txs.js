const R = require('ramda')
const ethers = require('ethers')
const errors = require('../errors')
const constants = require('ptokens-constants')
const { logger } = require('../get-logger')
const { getMerkleProof } = require('./get-merkle-proof')
const { constants: ptokensUtilsConstants, logic, utils } = require('ptokens-utils')
const { addDismissedReportsToState } = require('../state/state-operations.js')
const { STATE_TO_BE_DISMISSED_REQUESTS } = require('../state/constants')
const { callContractFunctionAndAwait } = require('./evm-call-contract-function')
const {
  logUserOperationFromAbiArgs,
  parseUserOperationFromReport,
} = require('./evm-parse-user-operation')
const abi = require('./abi/PNetworkHub').abi
const { addErrorToEvent } = require('../add-error-to-event')
const { gasPrice, gasLimit } = require('../../config.json')

// TODO: factor out (check evm-build-proposals-txs)
const addCancelledTxHashToEvent = R.curry((_event, _finalizedTxHash) => {
  // TODO: replace _id field
  const id = _event[constants.db.KEY_ID]
  logger.debug(`Adding ${_finalizedTxHash} to ${id.slice(0, 20)}...`)
  const cancelledTimestamp = new Date().toISOString()
  const updatedEvent = {
    ..._event,
    [constants.db.KEY_FINAL_TX_TS]: cancelledTimestamp,
    [constants.db.KEY_FINAL_TX_HASH]: _finalizedTxHash,
    [constants.db.KEY_STATUS]: constants.db.txStatus.CANCELLED,
  }
  return Promise.resolve(updatedEvent)
})

const cancelOperationErrorHandler = R.curry((resolve, reject, _eventReport, _err) =>
  _err.message.includes(errors.ERROR_OPERATION_NOT_QUEUED) ||
  _err.message.includes(errors.ERROR_CHALLENGE_PERIOD_TERMINATED)
    ? resolve(addCancelledTxHashToEvent(_eventReport, '0x'))
    : logger.error(_err) || resolve(addErrorToEvent(_eventReport, _err))
)

const makeDismissalContractCall = R.curry(
  (_wallet, _hubAddress, _proof, _txTimeout, _eventReport) =>
    new Promise((resolve, reject) => {
      const id = _eventReport[constants.db.KEY_ID]
      const eventName = _eventReport[constants.db.KEY_EVENT_NAME]

      if (!R.includes(eventName, R.values(constants.db.eventNames))) {
        return reject(new Error(`${errors.ERROR_INVALID_EVENT_NAME}: ${eventName}`))
      }

      const contractAddress = _hubAddress
      const functionName = 'protocolGuardianCancelOperation'
      const args = parseUserOperationFromReport(_eventReport)
      args.push(_proof)
      args.push({
        gasLimit,
        gasPrice,
      })

      const contract = new ethers.Contract(contractAddress, abi, _wallet)

      logger.info(`Executing _id: ${id}`)
      logUserOperationFromAbiArgs(functionName, args)

      return callContractFunctionAndAwait(functionName, args, contract, _txTimeout)
        .then(R.prop(constants.evm.ethers.KEY_TX_HASH))
        .then(addCancelledTxHashToEvent(_eventReport))
        .then(resolve)
        .catch(cancelOperationErrorHandler(resolve, reject, _eventReport))
    })
)

const sendDismissalTransactions = R.curry(
  async (_eventReports, _proof, _hubAddress, _timeOut, _wallet) => {
    logger.info(`Sending final txs w/ address ${_wallet.address} w/ proof ${_proof}`)
    const newReports = []
    for (const report of _eventReports) {
      const newReport = await makeDismissalContractCall(
        _wallet,
        _hubAddress,
        _proof,
        _timeOut,
        report
      )
      newReports.push(newReport)
      await logic.sleepForXMilliseconds(1000) // TODO: make configurable
    }

    return newReports
  }
)

// TODO: function very similar to the one for building proposals...factor out?
const buildDismissalTxsAndPutInState = _state =>
  new Promise((resolve, reject) => {
    logger.info('Building dismissal txs...')
    const invalidRequests = _state[STATE_TO_BE_DISMISSED_REQUESTS] || []
    const providerUrl = _state[constants.state.KEY_PROVIDER_URL]
    const identityGpgFile = _state[constants.state.KEY_IDENTITY_FILE]
    const provider = new ethers.JsonRpcProvider(providerUrl)
    const txTimeout = _state[constants.state.KEY_TX_TIMEOUT]
    const hub = _state[constants.state.KEY_HUB_ADDRESS]
    const db = _state[constants.state.KEY_DB]

    return utils
      .readIdentityFile(identityGpgFile)
      .then(_privateKey => new ethers.Wallet(_privateKey, provider))
      .then(_wallet => Promise.all([_wallet, getMerkleProof(db, _wallet.address)]))
      .then(([_wallet, _proof]) =>
        sendDismissalTransactions(invalidRequests, _proof, hub, txTimeout, _wallet)
      )
      .then(addDismissedReportsToState(_state))
      .then(resolve)
      .catch(reject)
  })

const maybeBuildDismissalTxsAndPutInState = _state =>
  new Promise(resolve => {
    const networkId = _state[constants.state.KEY_NETWORK_ID]
    const blockChainName = utils.flipObjectPropertiesSync(ptokensUtilsConstants.networkIds)[
      networkId
    ]
    const invalidRequests = _state[STATE_TO_BE_DISMISSED_REQUESTS] || []

    return invalidRequests.length > 0
      ? resolve(buildDismissalTxsAndPutInState(_state))
      : logger.info(`No dismissal to process for ${blockChainName}...`) || resolve(_state)
  })

module.exports = {
  maybeBuildDismissalTxsAndPutInState,
}
