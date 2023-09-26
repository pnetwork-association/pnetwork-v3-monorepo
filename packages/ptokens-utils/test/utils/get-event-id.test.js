const assert = require('assert')

describe('Tests for schemas utilities', () => {
  describe('getEventId', () => {
    it('Should return the correct ID', async () => {
      const { utils } = require('../..')
      const ret = await utils.getEventId({
        status: 'detected',
        eventName: 'UserOperation',
        nonce: '98322',
        destinationAccount: '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        destinationNetworkId: '0xf9b459a1',
        underlyingAssetName: 'pNetwork Token',
        underlyingAssetSymbol: 'PNT',
        underlyingAssetDecimals: 18,
        underlyingAssetTokenAddress: '0xdaacB0Ab6Fb34d24E8a67BfA14BF4D95D4C7aF92',
        underlyingAssetNetworkId: '0x5aca268b',
        assetTokenAddress: '0xdaacB0Ab6Fb34d24E8a67BfA14BF4D95D4C7aF92',
        assetAmount: '200000',
        userData: '0x',
        optionsMask: '0x0000000000000000000000000000000000000000000000000000000000000000',
        originatingBlockHash: null,
        originatingAddress: '0xddb5f4535123daa5ae343c24006f4075abaf5f7b',
        originatingNetworkId: null,
        originatingTransactionHash: null,
        blockHash: '0x05cf0e83408207704ee0ea2a4a6ea87905fc0d2038dbb610a0ca64f2cf47b134',
        networkId: '0x5aca268b',
        transactionHash: '0xb1bb8b6502edc17fdd0cc83505289a6d429a6381ffe5dbf4fe31a88dd236d643',
        proposedTransactionTimestamp: null,
        proposedTransactionHash: null,
        witnessedTimestamp: '2023-09-26T10:13:59.907Z',
        finalTransactionHash: null,
        finalTransactionTimestamp: null,
        forwardDestinationNetworkId: '0xb9286154',
        forwardNetworkFeeAssetAmount: '2000',
        networkFeeAssetAmount: '1000',
        protocolFeeAssetAmount: '0',
        isForProtocol: false,
      })

      assert.strictEqual(ret, '0xd9feb6e60cd73c396cbaeb3e5fa55c774c03a274c54f5bc53a62a59855ec7cc4')
    })
  })
})
