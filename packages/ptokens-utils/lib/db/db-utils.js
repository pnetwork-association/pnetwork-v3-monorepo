const { logger } = require('../logger')
const { checkType } = require('../validation')
const { map, prop, curry, flatten } = require('ramda')
const { SIDE_HOST, SIDE_NATIVE } = require('../constants')
const { getKeyFromObj, getChainSymbolFromBridgeType } = require('../utils')
const {
  getLastSeenNonceReportId,
  getReportIdFromNonce,
  getLastProcessedBlockReportId,
} = require('./db-ids')
const {
  getEmptyMongoPipeline,
  setReportBroadcastStatus,
  setReportBroadcastTxHash,
  setReportBroadscastTimestamp,
} = require('./db-reports-helpers')
const {
  findReports,
  updateReport,
  deleteReport,
  findReportById,
  editReportField,
} = require('./db-interface')
const {
  REPORTS_KEY_NONCE,
  REPORTS_KEY_BLOCK_NUM,
  REPORTS_KEY_BROADCAST,
  REPORTS_KEY_BROADCAST_TIMESTAMP,
  REPORT_ID_MAINNET_DEPOSIT_ADDRESS_ARRAY,
} = require('./db-constants')

const deleteReportWithNonce = curry(
  (_bridgeSide, _bridgeType, _legacy, _collection, _nonce) =>
    getReportIdFromNonce(_bridgeSide, _bridgeType, _legacy, _nonce).then(
      deleteReport(_collection)
    )
)

const deleteHostReport = deleteReportWithNonce(SIDE_HOST)

const deleteNativeReport = deleteReportWithNonce(SIDE_NATIVE)

const getLastNonce = curry((_bridgeSide, _bridgeType, _collection) =>
  getChainSymbolFromBridgeType(_bridgeSide, _bridgeType)
    .then(getLastSeenNonceReportId)
    .then(findReportById(_collection))
    .then(getKeyFromObj(REPORTS_KEY_NONCE))
)

const getLastNativeNonce = getLastNonce(SIDE_NATIVE)

const getLastHostNonce = getLastNonce(SIDE_HOST)

const getLastProcessedBlock = curry((_bridgeSide, _bridgeType, _collection) =>
  getChainSymbolFromBridgeType(_bridgeSide, _bridgeType)
    .then(getLastProcessedBlockReportId)
    .then(findReportById(_collection))
    .then(getKeyFromObj(REPORTS_KEY_BLOCK_NUM))
)

const getLastProcessedNativeBlock = getLastProcessedBlock(SIDE_NATIVE)

const getLastProcessedHostBlock = getLastProcessedBlock(SIDE_HOST)

const setLastProcessedBlock = curry(
  (_bridgeSide, _bridgeType, _collection, _blockNum) =>
    getChainSymbolFromBridgeType(_bridgeSide, _bridgeType)
      .then(getLastProcessedBlockReportId)
      .then(
        updateReport(_collection, {
          $set: { [REPORTS_KEY_BLOCK_NUM]: _blockNum },
        })
      )
)

const setLastProcessedHostBlock = setLastProcessedBlock(SIDE_HOST)

const setLastProcessedNativeBlock = setLastProcessedBlock(SIDE_NATIVE)

const getLegacyDepositAddressArray = curry(
  (
    _collection,
    _depositAddressArrayPrefix = REPORT_ID_MAINNET_DEPOSIT_ADDRESS_ARRAY
  ) =>
    findReports(_collection, { _id: new RegExp(_depositAddressArrayPrefix) })
      .then(map(prop(_depositAddressArrayPrefix)))
      .then(flatten)
)

const getAllDepositAddresses = curry(
  (
    _reportsCollection,
    _depositAddressesCollection,
    _depositAddressArrayPrefix = REPORT_ID_MAINNET_DEPOSIT_ADDRESS_ARRAY
  ) =>
    Promise.all([
      findReports(_depositAddressesCollection, {}),
      getLegacyDepositAddressArray(
        _reportsCollection,
        _depositAddressArrayPrefix
      ),
    ]).then(flatten)
)

const setLastNonce = curry((_bridgeSide, _bridgeType, _collection, _nonce) =>
  getChainSymbolFromBridgeType(_bridgeSide, _bridgeType)
    .then(getLastSeenNonceReportId)
    .then(editReportField(_collection, 'nonce', _nonce))
    .then(_id => logger.info(`Report '${_id}' updated w/ nonce ${_nonce}`))
)

const setLastHostNonce = setLastNonce(SIDE_HOST)

const setLastNativeNonce = setLastNonce(SIDE_NATIVE)

const getReport = curry(
  (_bridgeSide, _bridgeType, _legacy, _collection, _nonce) =>
    getReportIdFromNonce(_bridgeSide, _bridgeType, _legacy, _nonce).then(
      findReportById(_collection)
    )
)

const getHostReport = getReport(SIDE_HOST)

const getNativeReport = getReport(SIDE_NATIVE)

// Helper function: don't export it as parameters' ordering is not intuitive
const setFieldInReportToValue = curry(
  (
    _field,
    _fieldType,
    _bridgeSide,
    _bridgeType,
    _legacy,
    _collection,
    _nonce,
    _value
  ) =>
    checkType(_fieldType, _value)
      .then(_ =>
        getReportIdFromNonce(_bridgeSide, _bridgeType, _legacy, _nonce)
      )
      .then(editReportField(_collection, _field, _value))
)

const updateReportWithNonce = curry(
  (_bridgeSide, _bridgeType, _legacy, _collection, _nonce, _operations) =>
    getReportIdFromNonce(_bridgeSide, _bridgeType, _legacy, _nonce).then(
      updateReport(_collection, _operations)
    )
)

const setBroadcastStatus = setFieldInReportToValue(
  REPORTS_KEY_BROADCAST,
  'Boolean'
)

const setNativeBroadcastStatus = setBroadcastStatus(SIDE_NATIVE)

const setHostBroadcastStatus = setBroadcastStatus(SIDE_HOST)

const setBroadcastTimestamp = setFieldInReportToValue(
  REPORTS_KEY_BROADCAST_TIMESTAMP,
  'Number'
)

const setHostBroadcastTimestamp = setBroadcastTimestamp(SIDE_HOST)

const setNativeBroadcastTimestamp = setBroadcastStatus(SIDE_NATIVE)

const approveReport = curry(
  (_bridgeSide, _bridgeType, _legacy, _collection, _nonce, _txHash) =>
    getEmptyMongoPipeline()
      .then(setReportBroadcastStatus(true))
      .then(setReportBroadcastTxHash(_bridgeSide, _bridgeType, _txHash))
      .then(setReportBroadscastTimestamp(Math.round(Date.now() / 1000)))
      .then(
        updateReportWithNonce(
          _bridgeSide,
          _bridgeType,
          _legacy,
          _collection,
          _nonce
        )
      )
      .then(_id => logger.info(`Report '${_id}' has been approved!`))
)

const approveNativeReport = approveReport(SIDE_NATIVE)

const approveHostReport = approveReport(SIDE_HOST)

module.exports = {
  deleteReportWithNonce,
  deleteHostReport,
  deleteNativeReport,
  getLastNonce,
  getLastNativeNonce,
  getLastHostNonce,
  getLastProcessedBlock,
  getLastProcessedHostBlock,
  getLastProcessedNativeBlock,
  setLastProcessedBlock,
  setLastProcessedHostBlock,
  setLastProcessedNativeBlock,
  getLegacyDepositAddressArray,
  getAllDepositAddresses,
  setLastNonce,
  setLastHostNonce,
  setLastNativeNonce,
  getReport,
  getHostReport,
  getNativeReport,
  approveReport,
  approveNativeReport,
  approveHostReport,
  setFieldInReportToValue,
  setBroadcastStatus,
  setNativeBroadcastStatus,
  setHostBroadcastStatus,
  setBroadcastTimestamp,
  setHostBroadcastTimestamp,
  setNativeBroadcastTimestamp,
}
