const assert = require('assert')
const { db, constants, errors, bridgeTypes } = require('../..')

const types = require('../../lib/constants/bridge-sides')

describe('Database utils tests', () => {
  const legacyBridgeTypes = [bridgeTypes.PBTC_ON_ETH, bridgeTypes.PBTC_ON_EOS]
  const nonLegacyBridgeTypes = Object.values(bridgeTypes)
  describe('getReportIdPrefix', () => {
    it('Should return the correct legacy prefixes', async () => {
      const isLegacy = true
      const expectedNative = ['pBTC_BTC ', 'pBTC_BTC ']
      const expectedHost = ['pBTC_ETH ', 'pBTC_EOS ']

      assert.equal(expectedNative.length, expectedHost.length)

      for (let i = 0; i < legacyBridgeTypes.length; i++) {
        const resultNative = await db.getReportIdPrefix(
          constants.SIDE_NATIVE,
          legacyBridgeTypes[i],
          isLegacy
        )
        const resultHost = await db.getReportIdPrefix(
          constants.SIDE_HOST,
          legacyBridgeTypes[i],
          isLegacy
        )

        assert.equal(resultNative, expectedNative[i])
        assert.equal(resultHost, expectedHost[i])
      }
    })

    it('Should return the correct non-legacy report prefixes', async () => {
      const isLegacy = false
      const expectedNative = [
        'pbtc-on-eth-btc-',
        'pbtc-on-eos-btc-',
        'pbtc-on-int-btc-',
        'perc20-on-evm-eth-',
        'perc20-on-eos-eth-',
        'perc20-on-int-eth-',
        'pint-on-evm-int-',
        'pint-on-eos-int-',
        'peos-on-eth-eos-',
        'peos-on-int-eos-',
        'palgo-on-int-algo-',
        'pint-on-algo-int-',
      ]

      const expectedHost = [
        'pbtc-on-eth-eth-',
        'pbtc-on-eos-eos-',
        'pbtc-on-int-int-',
        'perc20-on-evm-evm-',
        'perc20-on-eos-eos-',
        'perc20-on-int-int-',
        'pint-on-evm-evm-',
        'pint-on-eos-eos-',
        'peos-on-eth-eth-',
        'peos-on-int-int-',
        'palgo-on-int-int-',
        'pint-on-algo-algo-',
      ]

      assert.equal(expectedNative.length, expectedHost.length)

      for (let i = 0; i < nonLegacyBridgeTypes.length; i++) {
        const resultNative = await db.getReportIdPrefix(
          constants.SIDE_NATIVE,
          nonLegacyBridgeTypes[i],
          isLegacy
        )
        const resultHost = await db.getReportIdPrefix(
          constants.SIDE_HOST,
          nonLegacyBridgeTypes[i],
          isLegacy
        )
        assert.equal(resultNative, expectedNative[i])
        assert.equal(resultHost, expectedHost[i])
      }
    })

    it('Should reject when a non-legacy bridge is used with the legacy flag', async () => {
      const isLegacy = true
      for (let i = 0; i < nonLegacyBridgeTypes.length; i++) {
        for (let j = 0; j < types.length; j++) {
          const type = types[j]
          try {
            await db.getReportIdPrefix(type, nonLegacyBridgeTypes[i], isLegacy)
            assert.fail('Should never reach here')
          } catch (err) {
            assert(err.message.includes('This bridge type IS NOT legacy'))
          }
        }
      }
    })

    it('Should reject with an error for an invalid type submitted', async () => {
      const bridgeSide = 'invalid'
      let isLegacy = false
      for (let i = nonLegacyBridgeTypes.length - 1; i >= 0; i--) {
        try {
          await db.getReportIdPrefix(
            bridgeSide,
            nonLegacyBridgeTypes[i],
            isLegacy
          )
          assert.fail('Should never reach here')
        } catch (err) {
          assert(err.message.includes(errors.ERROR_INVALID_BRIDGE_SIDE))
        }
      }

      isLegacy = true
      for (let i = legacyBridgeTypes.length - 1; i >= 0; i--) {
        try {
          await db.getReportIdPrefix(bridgeSide, legacyBridgeTypes[i], isLegacy)
          assert.fail()
        } catch (err) {
          assert(err.message.includes(errors.ERROR_INVALID_BRIDGE_SIDE))
        }
      }
    })
  })

  describe('getReportIdFromNonce', () => {
    it('Should get the correct report id for a LEGACY bridge', async () => {
      const isLegacy = true
      const nonce = 4242
      const bridgeSides = [constants.SIDE_HOST, constants.SIDE_NATIVE]
      const expected = {
        [constants.SIDE_HOST]: [`pBTC_ETH ${nonce}`, `pBTC_EOS ${nonce}`],
        [constants.SIDE_NATIVE]: [`pBTC_BTC ${nonce}`, `pBTC_BTC ${nonce}`],
      }

      assert.equal(
        expected[constants.SIDE_HOST].length,
        legacyBridgeTypes.length
      )
      assert.equal(
        expected[constants.SIDE_NATIVE].length,
        legacyBridgeTypes.length
      )

      for (let i = legacyBridgeTypes.length - 1; i >= 0; i--) {
        for (let j = bridgeSides.length - 1; j >= 0; j--) {
          const result = await db.getReportIdFromNonce(
            bridgeSides[j],
            legacyBridgeTypes[i],
            isLegacy,
            nonce
          )

          assert.equal(result, expected[bridgeSides[j]][i])
        }
      }
    })

    it('Should get the correct report id for a non-LEGACY bridge', async () => {
      const isLegacy = false
      const nonce = 4242
      const bridgeSides = [constants.SIDE_HOST, constants.SIDE_NATIVE]
      const expected = {
        [constants.SIDE_HOST]: [
          `pbtc-on-eth-eth-${nonce}`,
          `pbtc-on-eos-eos-${nonce}`,
          `pbtc-on-int-int-${nonce}`,
          `perc20-on-evm-evm-${nonce}`,
          `perc20-on-eos-eos-${nonce}`,
          `perc20-on-int-int-${nonce}`,
          `pint-on-evm-evm-${nonce}`,
          `pint-on-eos-eos-${nonce}`,
          `peos-on-eth-eth-${nonce}`,
          `peos-on-int-int-${nonce}`,
          `palgo-on-int-int-${nonce}`,
          `pint-on-algo-algo-${nonce}`,
        ],
        [constants.SIDE_NATIVE]: [
          `pbtc-on-eth-btc-${nonce}`,
          `pbtc-on-eos-btc-${nonce}`,
          `pbtc-on-int-btc-${nonce}`,
          `perc20-on-evm-eth-${nonce}`,
          `perc20-on-eos-eth-${nonce}`,
          `perc20-on-int-eth-${nonce}`,
          `pint-on-evm-int-${nonce}`,
          `pint-on-eos-int-${nonce}`,
          `peos-on-eth-eos-${nonce}`,
          `peos-on-int-eos-${nonce}`,
          `palgo-on-int-algo-${nonce}`,
          `pint-on-algo-int-${nonce}`,
        ],
      }

      assert.equal(
        expected[constants.SIDE_HOST].length,
        nonLegacyBridgeTypes.length
      )
      assert.equal(
        expected[constants.SIDE_NATIVE].length,
        nonLegacyBridgeTypes.length
      )

      for (let i = nonLegacyBridgeTypes.length - 1; i >= 0; i--) {
        for (let j = bridgeSides.length - 1; j >= 0; j--) {
          const result = await db.getReportIdFromNonce(
            bridgeSides[j],
            nonLegacyBridgeTypes[i],
            isLegacy,
            nonce
          )

          assert.equal(result, expected[bridgeSides[j]][i])
        }
      }
    })
  })
})
