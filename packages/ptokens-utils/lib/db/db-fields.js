const { getChainSymbolFromBridgeType } = require('../utils')

const getReportTxHashField = (_bridgeSide, _bridgeType) =>
  getChainSymbolFromBridgeType(_bridgeSide, _bridgeType)
    .then(_symbol => `${_symbol}_tx_hash`)

module.exports = {
  getReportTxHashField
}