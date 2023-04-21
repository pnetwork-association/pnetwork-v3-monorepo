const assert = require('assert')

describe('Tests for schemas utilities', () => {
  describe('getEventId', () => {
    it('Should return the correct ID', async () => {
      const { utils } = require('../..')
      const ret = await utils.getEventId({
        status: 'detected',
        eventName: 'UserOperation',
        nonce: 52083,
        destinationAccount: '0xa41657bf225F8Ec7E2010C89c3F084172948264D',
        destinationNetworkId: '0xe15503e4',
        underlyingAssetName: 'Token',
        underlyingAssetSymbol: 'TKN',
        underlyingAssetDecimals: 18,
        underlyingAssetTokenAddress: '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        underlyingAssetNetworkId: '0xe15503e4',
        assetTokenAddress: '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        assetAmount: '100000000000000000000',
        userData: '0x',
        optionsMask: '0x0000000000000000000000000000000000000000000000000000000000000000',
        originatingBlockHash: '0xe19ab626cfc3f471238da9a375d396e3bd8a10c55601425d69677c908f0ad8f1',
        originatingAddress: null,
        originatingNetworkId: '0xe15503e4',
        originatingTransactionHash:
          '0x009fb472130864d1ea9d9e011a1e5ff2d1fae827668f2807146dd3e227eb42ce',
        proposedTransactionTimestamp: null,
        proposedTransactionHash: null,
        witnessedTimestamp: '2023-03-14T16:00:00.000Z',
        finalTransactionHash: null,
        finalTransactionTimestamp: null,
      })

      assert.strictEqual(ret, '0x5ac3de11a54ac11a448052ad1c3f57ab5fe18a35024aa6fee622620fd1098d55')
    })
  })
})
