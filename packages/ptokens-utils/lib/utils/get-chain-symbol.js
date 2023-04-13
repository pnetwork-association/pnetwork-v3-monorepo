const {
  ERROR_INVALID_BRIDGE_SIDE,
  ERROR_INVALID_SYMBOL_FOR_BRIDGE_TYPE,
} = require('../errors')
const R = require('ramda')
const { SIDE_HOST, SIDE_NATIVE } = require('../constants')

const extractHostSymbolFromBridgeType = R.memoizeWith(R.identity, _bridgeType =>
  Promise.resolve(_bridgeType.split('-')[2])
)

const extractNativeSymboFromBridgeType = R.memoizeWith(
  R.identity,
  _bridgeType =>
    Promise.resolve(_bridgeType.split('-')[0].slice(1).replace('erc20', 'eth'))
)

// TODO: memoize
const getChainSymbolFromBridgeType = R.curry((_bridgeSide, _bridgeType) => {
  switch (_bridgeSide) {
    case SIDE_HOST:
      return extractHostSymbolFromBridgeType(_bridgeType)
    case SIDE_NATIVE:
      return extractNativeSymboFromBridgeType(_bridgeType)
    default:
      return Promise.reject(
        new Error(`${ERROR_INVALID_BRIDGE_SIDE}: '${_bridgeSide}'`)
      )
  }
})

const getHostChainSymbolFromBridgeType = getChainSymbolFromBridgeType(SIDE_HOST)

const getNativeChainSymbolFromBridgeType =
  getChainSymbolFromBridgeType(SIDE_NATIVE)

// TODO: memoize
const getSubmissionChainSymbolFromOutputTxType = R.curry(
  (_outputTxType, _bridgeType) => {
    // Note: this function here is used by syncers where output tx type
    // is defined as the type of output emitted by the enclave upon block submission.
    // i.e. the output tx type for pbtc-on-eth on the eth-syncer is 'native'
    // while for the btc syncer is 'host'
    switch (_outputTxType) {
      case SIDE_NATIVE:
        return getChainSymbolFromBridgeType(SIDE_HOST, _bridgeType)
      case SIDE_HOST:
        return getChainSymbolFromBridgeType(SIDE_NATIVE, _bridgeType)
      default:
        return Promise.reject(
          new Error(`Invalid output tx type: '${_outputTxType}'`)
        )
    }
  }
)

// TODO: memoize
const getBridgeSideForSymbol = R.curry((_bridgeType, _symbol) =>
  Promise.all([
    getHostChainSymbolFromBridgeType(_bridgeType),
    getNativeChainSymbolFromBridgeType(_bridgeType),
  ]).then(([_hostSymbol, _nativeSymbol]) => {
    if (_hostSymbol === _symbol) return SIDE_HOST
    else if (_nativeSymbol === _symbol) return SIDE_NATIVE
    else
      return Promise.reject(
        new Error(`${ERROR_INVALID_SYMBOL_FOR_BRIDGE_TYPE} - ${_symbol}`)
      )
  })
)

// This is for getting a the bridge side given only
// the bridge name, so no symbol is required. This
// makes only sense on V2 bridges, where a single
// bridge is composed of two bridges, one that
// represents the native side (i.e. pbtc-on-int)
// and one representing the host side (i.e. pint-on-eth)
const getBridgeSideFromV2BridgeType = _bridgeName =>
  getBridgeSideForSymbol(_bridgeName, 'int').then(_side => {
    switch (_side) {
      case SIDE_HOST:
        return SIDE_NATIVE
      case SIDE_NATIVE:
        return SIDE_HOST
      default:
        Promise.reject(new Error(`Invalid side given ${_side}`))
    }
  })

module.exports = {
  getBridgeSideForSymbol,
  getBridgeSideFromV2BridgeType,
  getChainSymbolFromBridgeType,
  getHostChainSymbolFromBridgeType,
  getNativeChainSymbolFromBridgeType,
  getSubmissionChainSymbolFromOutputTxType,
}
