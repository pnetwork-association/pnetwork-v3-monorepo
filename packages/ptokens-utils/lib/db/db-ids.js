const { SIDE_HOST, SIDE_NATIVE } = require('../constants')
const { getChainSymbolFromBridgeType } = require('../utils')
const { PBTC_ON_ETH, PBTC_ON_EOS } = require('../bridge-types')
const R = require('ramda')

const getLastProcessedBlockReportId = R.memoizeWith(
  R.identity,
  _chainSymbol => `pbtc_enclave-last-processed-${_chainSymbol}-block`
)

const getLastSeenNonceReportId = R.memoizeWith(
  R.identity,
  _chainSymbol => `last-seen-${R.toLower(_chainSymbol)}-account-nonce`
)

const getLegacyReportIdPrefix = (_bridgeSide, _bridgeType) =>
  getChainSymbolFromBridgeType(_bridgeSide, _bridgeType).then(_symbol => {
    const legacyBridges = [PBTC_ON_ETH, PBTC_ON_EOS]
    if (!legacyBridges.includes(_bridgeType))
      return Promise.reject(
        new Error(`This bridge type IS NOT legacy: ${_bridgeType}`)
      )

    switch (_bridgeSide) {
      case SIDE_NATIVE:
        return 'pBTC_BTC '
      case SIDE_HOST:
        return `pBTC_${_symbol.toUpperCase()} `
      default:
        return Promise.reject(
          new Error(`Invalid type for legacy prefix: '${_bridgeSide}'`)
        )
    }
  })

const getNonLegacyReportIdPrefix = (_bridgeSide, _bridgeType) =>
  getChainSymbolFromBridgeType(_bridgeSide, _bridgeType).then(_symbol => {
    const allowedSides = [SIDE_HOST, SIDE_NATIVE]

    if (!allowedSides.includes(_bridgeSide))
      return Promise.reject(
        new Error(`Invalid side for non legacy prefix: '${_bridgeSide}'`)
      )

    return `${_bridgeType}-${_symbol}-`
  })

const getReportIdPrefix = R.curry((_bridgeSide, _bridgeType, _isLegacy) =>
  _isLegacy
    ? getLegacyReportIdPrefix(_bridgeSide, _bridgeType)
    : getNonLegacyReportIdPrefix(_bridgeSide, _bridgeType)
)

const getReportIdFromNonce = R.curry(
  (_bridgeSide, _bridgeType, _legacy, _nonce) =>
    getReportIdPrefix(_bridgeSide, _bridgeType, _legacy).then(
      _prefix => `${_prefix}${_nonce}`
    )
)

const getHostReportIdPrefix = getReportIdPrefix('host')

const getNativeReportIdPrefix = getReportIdPrefix('native')

const getHostReportId = getReportIdFromNonce('host')

const getNativeReportId = getReportIdFromNonce('native')

module.exports = {
  getReportIdPrefix,
  getHostReportIdPrefix,
  getNativeReportIdPrefix,
  getHostReportId,
  getNativeReportId,
  getReportIdFromNonce,
  getLastSeenNonceReportId,
  getLastProcessedBlockReportId,
}
