const R = require('ramda')
const ethers = require('ethers')
const abi = require('./abi/PNetworkHub')
const constants = require('ptokens-constants')
const { logger } = require('../get-logger')
const { utils } = require('ptokens-utils')
const { STATE_DETECTED_DB_REPORTS, STATE_QUEUED_DB_REPORTS } = require('../state/constants')
const { updateEventInDb } = require('../update-events-in-db')
const { parseUserOperationFromReport } = require('./evm-parse-user-operation')
const {
  getDetectedEventsFromDbAndPutInState,
  getQueuedEventsFromDbAndPutInState,
} = require('../get-events-from-db')
// See ptokens-evm-contracts/contracts/libraries/Constants.sol
const OPERATION_NULL = 0x00
const OPERATION_QUEUED = 0x01
const OPERATION_EXECUTED = 0x02
const OPERATION_CANCELLED = 0x03

const getOperationStatusFromOxValue = _0xStatus => {
  switch (_0xStatus) {
    case OPERATION_NULL:
      return constants.db.txStatus.DETECTED
    case OPERATION_QUEUED:
      return constants.db.txStatus.PROPOSED
    case OPERATION_EXECUTED:
      return constants.db.txStatus.FINALIZED
    case OPERATION_CANCELLED:
      return constants.db.txStatus.CANCELLED
    default:
      return constants.db.txStatus.DETECTED
  }
}

const setCorrectRequestStatusInDb = (_db, _request, _onChainStatus) =>
  new Promise(resolve => {
    const onChainStatus = getOperationStatusFromOxValue(_onChainStatus)
    const savedStatus = _request[constants.db.KEY_STATUS]

    if (savedStatus !== onChainStatus) {
      logger.info(
        `Changing status of report ${
          _request[constants.db.KEY_ID]
        } from '${savedStatus}' to '${onChainStatus}'`
      )
      const updatedRequest = R.assoc(constants.db.KEY_STATUS, onChainStatus, _request)
      return updateEventInDb(_db, updatedRequest).then(resolve)
    }

    return resolve()
  })

const setRequestsStatusAccordinglyIntoDb = R.curry((_db, _actualRequests, _onChainStatuses) =>
  utils
    .rejectIfNotEqual(
      `Lengths do not match! (${_actualRequests.length} != ${_onChainStatuses.length})`,
      _actualRequests.length,
      _onChainStatuses.length
    )
    .then(
      _ =>
        logger.info('Maybe reflect on chain status on stored requests...') ||
        Promise.all(
          _actualRequests.map((_request, _index) =>
            setCorrectRequestStatusInDb(_db, _request, _onChainStatuses[_index])
          )
        )
    )
)

const getOperationStatus = R.curry(
  (_provider, _hubAddress, _report) =>
    new Promise(resolve => {
      const args = parseUserOperationFromReport(_report)
      const hub = new ethers.Contract(_hubAddress, abi, _provider)
      logger.info(`Getting operation status of ${_report[constants.db.KEY_ID].slice(0, 20)}...`)

      return hub
        .operationStatusOf(...args)
        .then(parseInt)
        .then(resolve)
    })
)

const filterOutDetectedEventsWithWrongStatusAndPutInState = _state =>
  new Promise(resolve => {
    const detectedOperations = _state[STATE_DETECTED_DB_REPORTS]
    const providerUrl = _state[constants.state.KEY_PROVIDER_URL]
    const hubAddress = _state[constants.state.KEY_HUB_ADDRESS]
    const provider = new ethers.JsonRpcProvider(providerUrl)
    const db = _state[constants.state.KEY_DB]
    logger.info('Checking EVM requests on chain status...')
    return Promise.all(detectedOperations.map(getOperationStatus(provider, hubAddress)))
      .then(setRequestsStatusAccordinglyIntoDb(db, detectedOperations))
      .then(_ => getDetectedEventsFromDbAndPutInState(_state))
      .then(resolve)
  })

const filterOutQueuedOperationsWithWrongStatusAndPutInState = _state =>
  new Promise(resolve => {
    const queuedOperations = _state[STATE_QUEUED_DB_REPORTS]
    const providerUrl = _state[constants.state.KEY_PROVIDER_URL]
    const hubAddress = _state[constants.state.KEY_HUB_ADDRESS]
    const provider = new ethers.JsonRpcProvider(providerUrl)
    const db = _state[constants.state.KEY_DB]

    logger.info('Checking EVM requests on chain status...')
    return Promise.all(queuedOperations.map(getOperationStatus(provider, hubAddress)))
      .then(setRequestsStatusAccordinglyIntoDb(db, queuedOperations))
      .then(_ => getQueuedEventsFromDbAndPutInState(_state))
      .then(resolve)
  })

module.exports = {
  filterOutDetectedEventsWithWrongStatusAndPutInState,
  filterOutQueuedOperationsWithWrongStatusAndPutInState,
}
