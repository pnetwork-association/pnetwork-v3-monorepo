const assert = require('assert')
const { db, bridgeTypes, constants } = require('../..')

describe('DB fields tests', () => {
  describe('getReportTxHashField', () => {
    it('Should get the correct tx hash field for type host', async () => {
      const expected = [
        'eth_tx_hash', 'eos_tx_hash',
        'int_tx_hash', 'evm_tx_hash',
        'eos_tx_hash', 'int_tx_hash',
        'evm_tx_hash', 'eos_tx_hash',
        'eth_tx_hash', 'int_tx_hash',
        'int_tx_hash', 'algo_tx_hash'
      ]

      await Object.values(bridgeTypes).map(async (_bridgeType, _i) => {
        const result = await db.getReportTxHashField(constants.SIDE_HOST, _bridgeType)
        assert.equal(result, expected[_i])
      })
    })

    it('Should get the correct tx hash field for the type native', async () => {
      const expected = [
        'btc_tx_hash', 'btc_tx_hash',
        'btc_tx_hash', 'eth_tx_hash',
        'eth_tx_hash', 'eth_tx_hash',
        'int_tx_hash', 'int_tx_hash',
        'eos_tx_hash', 'eos_tx_hash',
        'algo_tx_hash', 'int_tx_hash',
      ]

      await Object.values(bridgeTypes).map(async (_bridgeType, _i) => {
        const result = await db.getReportTxHashField(constants.SIDE_NATIVE, _bridgeType)
        assert.equal(result, expected[_i])
      })
    })
  })
})