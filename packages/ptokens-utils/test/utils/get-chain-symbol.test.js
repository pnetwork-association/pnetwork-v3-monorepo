const assert = require('assert')
const R = require('ramda')
const { utils, errors, constants, bridgeTypes } = require('../..')

describe('Get chain symbols tests', () => {
  describe('getNativeChainSymbolFromBridgeType', () => {
    it('Should retrieve the correct native symbol for each bridgeType', async () => {
      const expected = [
        'btc',
        'btc',
        'btc',
        'eth',
        'eth',
        'eth',
        'int',
        'int',
        'eos',
        'eos',
        'algo',
        'int',
      ]

      await R.values(bridgeTypes).map(async (_bridgeType, _i) => {
        const nativeSymbol = await utils.getNativeChainSymbolFromBridgeType(
          _bridgeType
        )
        assert.equal(nativeSymbol, expected[_i])
      })
    })
  })

  describe('getHostChainSymbolFromBridgeType', () => {
    it('Should retrieve the correct host symbol for each bridgeType', async () => {
      const expected = [
        'eth',
        'eos',
        'int',
        'evm',
        'eos',
        'int',
        'evm',
        'eos',
        'eth',
        'int',
        'int',
        'algo',
      ]

      await R.values(bridgeTypes).map(async (_bridgeType, _i) => {
        const hostSymbol = await utils.getHostChainSymbolFromBridgeType(
          _bridgeType
        )
        assert.equal(hostSymbol, expected[_i])
      })
    })
  })

  describe('getChainSymbolFromBridgeType', () => {
    it('Should reject for an invalid bridge side', async () => {
      const side = 'InvalidSide'
      const errorExpected = `${errors.ERROR_INVALID_BRIDGE_SIDE}: '${side}'`
      try {
        await utils.getChainSymbolFromBridgeType(side, 'pbtc-on-eth')
        assert.fail('Should never reach here')
      } catch (err) {
        assert.equal(err.message, errorExpected)
      }
    })
  })

  describe('getSubmissionChainSymbolFromOutputTxType', () => {
    it('Should retrieve the correct submission symbol for the native output tx type', async () => {
      const expected = [
        'eth',
        'eos',
        'int',
        'evm',
        'eos',
        'int',
        'evm',
        'eos',
        'eth',
        'int',
        'int',
        'algo',
      ]

      const outputTxType = 'native'

      await R.values(bridgeTypes).map(async (_bridgeType, _i) => {
        const hostSymbol = await utils.getSubmissionChainSymbolFromOutputTxType(
          outputTxType,
          _bridgeType
        )
        assert.equal(hostSymbol, expected[_i])
      })
    })

    it('Should retrieve the correct submission symbol for the host output tx type', async () => {
      const expected = [
        'btc',
        'btc',
        'btc',
        'eth',
        'eth',
        'eth',
        'int',
        'int',
        'eos',
        'eos',
        'algo',
        'int',
      ]
      const outputTxType = 'host'

      await R.values(bridgeTypes).map(async (_bridgeType, _i) => {
        const nativeSymbol =
          await utils.getSubmissionChainSymbolFromOutputTxType(
            outputTxType,
            _bridgeType
          )
        assert.equal(nativeSymbol, expected[_i])
      })
    })
  })

  describe('getBridgeSideForSymbol', () => {
    it('Should retrieve the correct bridge side for each bridge type', async () => {
      const nativeSymbols = [
        'btc',
        'btc',
        'btc',
        'erc20',
        'erc20',
        'erc20',
        'int',
        'int',
        'eos',
        'eos',
        'algo',
        'int',
      ]

      const hostSymbols = [
        'eth',
        'eos',
        'int',
        'evm',
        'eos',
        'int',
        'evm',
        'eos',
        'eth',
        'int',
        'int',
        'algo',
      ]

      assert.equal(nativeSymbols.length, hostSymbols.length)
      assert.equal(nativeSymbols.length, R.values(bridgeTypes).length)

      await R.values(bridgeTypes).map(async (bridgeType, i) => {
        const maybeNativeSide = await utils.getBridgeSideForSymbol(
          bridgeType,
          nativeSymbols[i]
        )
        const maybeHostSide = await utils.getBridgeSideForSymbol(
          bridgeType,
          hostSymbols[i]
        )

        assert.equal(maybeNativeSide, constants.SIDE_NATIVE)
        assert.equal(maybeHostSide, constants.SIDE_HOST)
      })
    })

    it('Should reject when using an invalid symbol for a given bridge type', async () => {
      const bridgeType = 'pbtc-on-int'
      const invalidSymbols = ['algo', 'evm', 'eth', 'something']

      await invalidSymbols.map(async symbol => {
        try {
          await utils.getBridgeSideForSymbol(bridgeType, symbol)
          assert.fail('Should never reach here')
        } catch (err) {
          assert(
            err.message.includes(errors.ERROR_INVALID_SYMBOL_FOR_BRIDGE_TYPE)
          )
        }
      })
    })
  })

  describe('getBridgeSideFromV2BridgeType', () => {
    it('Should get the correct side for each bridge configuration', async () => {
      const expected = [
        'native',
        'native',
        'host',
        'host',
        'native',
        'native',
        'host',
      ]

      const v2BridgesFilterRegexp = new RegExp('int')
      const v2BridgeTypes = R.values(bridgeTypes).filter(_bridge =>
        v2BridgesFilterRegexp.test(_bridge)
      )

      await R.values(v2BridgeTypes).map(async (_bridgeType, _i) => {
        const side = await utils.getBridgeSideFromV2BridgeType(_bridgeType)
        assert.equal(side, expected[_i])
      })
    })

    it('Should reject with a non-v2 bridge', async () => {
      const v2BridgesFilterRegexp = new RegExp('^((?!int).)*$')
      const v2BridgeTypes = R.values(bridgeTypes).filter(_bridge =>
        v2BridgesFilterRegexp.test(_bridge)
      )

      await R.values(v2BridgeTypes).map(async (_bridgeType, _i) => {
        try {
          await utils.getBridgeSideFromV2BridgeType(_bridgeType)
        } catch (err) {
          assert.equal(
            err.message,
            'Invalid symbol for the given bridge type - int'
          )
        }
      })
    })
  })
})
