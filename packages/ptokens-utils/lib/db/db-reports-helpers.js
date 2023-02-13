const { checkType } = require('../validation')
const { isNil, curry, append } = require('ramda')
const { getReportTxHashField } = require('./db-fields')
const { getChainSymbolFromBridgeType } = require('../utils')
const {
  REPORTS_KEY_BROADCAST,
  REPORTS_KEY_BROADCAST_TX_HASH,
  REPORTS_KEY_BROADCAST_TIMESTAMP,
} = require('./db-constants')

const getEmptyMongoPipeline = () => Promise.resolve([])

const rejectIfTxHashIsNilForEosBridge = curry(
  (_bridgeSide, _bridgeType, _txHash) =>
    getChainSymbolFromBridgeType(_bridgeSide, _bridgeType).then(_symbol =>
      _symbol === 'eos' && isNil(_txHash)
        ? Promise.reject(
            new Error(
              `A tx hash is required for EOS related reports - value given ${_txHash}`
            )
          )
        : Promise.resolve()
    )
)

const setReportBroadcastTxHash = curry(
  (_bridgeSide, _bridgeType, _txHash, _mongoOpsPipeline) =>
    rejectIfTxHashIsNilForEosBridge(_bridgeSide, _bridgeType, _txHash)
      .then(_ => checkType('Array', _mongoOpsPipeline))
      .then(_ => getReportTxHashField(_bridgeSide, _bridgeType))
      .then(_txHashField =>
        isNil(_txHash)
          ? append(
              { $set: { [REPORTS_KEY_BROADCAST_TX_HASH]: `$${_txHashField}` } },
              _mongoOpsPipeline
            ) // copies the value from ...tx_hash to broadscast_tx_hash
          : append(
              { $set: { [REPORTS_KEY_BROADCAST_TX_HASH]: _txHash } },
              _mongoOpsPipeline
            )
      )
)

const setReportBroadcastStatus = curry((_boolean, _mongoOpsPipeline) =>
  checkType('Boolean', _boolean)
    .then(_ => checkType('Array', _mongoOpsPipeline))
    .then(_ =>
      append({ $set: { [REPORTS_KEY_BROADCAST]: _boolean } }, _mongoOpsPipeline)
    )
)

const setReportBroadscastTimestamp = curry((_timestamp, _mongoOpsPipeline) =>
  checkType('Number', _timestamp)
    .then(_ => checkType('Array', _mongoOpsPipeline))
    .then(_ =>
      append(
        { $set: { [REPORTS_KEY_BROADCAST_TIMESTAMP]: _timestamp } },
        _mongoOpsPipeline
      )
    )
)

module.exports = {
  getEmptyMongoPipeline,
  setReportBroadcastStatus,
  setReportBroadcastTxHash,
  setReportBroadscastTimestamp,
}
