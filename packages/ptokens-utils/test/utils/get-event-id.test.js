const assert = require('assert')

describe('Tests for schemas utilities', () => {
  describe('getEventId', () => {
    it('Should return the correct ID', async () => {
      const { utils } = require('../..')
      const ret = await utils.getEventId({
        status: 'detected',
        eventName: 'UserOperation',
        nonce: '96957',
        destinationAccount: '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        destinationNetworkId: '0xf9b459a1',
        underlyingAssetName: 'pTokens PNT',
        underlyingAssetSymbol: 'PNT',
        underlyingAssetDecimals: 18,
        underlyingAssetTokenAddress: '0xB6bcae6468760bc0CDFb9C8ef4Ee75C9dd23e1Ed',
        underlyingAssetNetworkId: '0xf9b459a1',
        assetTokenAddress: '0xB6bcae6468760bc0CDFb9C8ef4Ee75C9dd23e1Ed',
        assetAmount: '10000',
        userData: '0x',
        optionsMask: '0x0000000000000000000000000000000000000000000000000000000000000000',
        originatingBlockHash: null,
        originatingAddress: '0xddb5f4535123daa5ae343c24006f4075abaf5f7b',
        originatingNetworkId: null,
        originatingTransactionHash: null,
        blockHash: '0x5564ff44bbc274cc1f034049171484422ab513d3256f792fa7d77709898d9da1',
        networkId: '0xf9b459a1',
        transactionHash: '0x27bc16d385587b1ce31c93b4a17a3c6383f775d80aed7ff7ecd3315d16479daf',
        proposedTransactionTimestamp: null,
        proposedTransactionHash: null,
        witnessedTimestamp: '2023-10-04T07:46:11.812Z',
        finalTransactionHash: null,
        finalTransactionTimestamp: null,
        forwardDestinationNetworkId: '0xb9286154',
        forwardNetworkFeeAssetAmount: '2000',
        networkFeeAssetAmount: '1000',
        userDataProtocolFeeAssetAmount: '0',
        isForProtocol: false,
        eventArgs: [
          '96957',
          '0xddb5f4535123daa5ae343c24006f4075abaf5f7b',
          '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
          '0xf9b459a1',
          'pTokens PNT',
          'PNT',
          '18',
          '0xB6bcae6468760bc0CDFb9C8ef4Ee75C9dd23e1Ed',
          '0xf9b459a1',
          '0xB6bcae6468760bc0CDFb9C8ef4Ee75C9dd23e1Ed',
          '10000',
          '0',
          '1000',
          '2000',
          '0xb9286154',
          '0x',
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          false,
        ],
      })
      // tuple for operationIdOf
      // ["0x5564ff44bbc274cc1f034049171484422ab513d3256f792fa7d77709898d9da1", "0x27bc16d385587b1ce31c93b4a17a3c6383f775d80aed7ff7ecd3315d16479daf", "0x0000000000000000000000000000000000000000000000000000000000000000", 96957, 18, 10000, 0, 1000, 2000, "0xb6bcae6468760bc0cdfb9c8ef4ee75c9dd23e1ed", "0xf9b459a1", "0xF9B459A1", "0xB9286154", "0xF9B459A1", "0xddb5f4535123daa5ae343c24006f4075abaf5f7b", "0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B", "pTokens PNT", "PNT", "0x", false]
      assert.strictEqual(ret, '0x28d30444ebd3565616671335bd5a4a9cb6fcec188b5e831f29ce6a9b990a6011')
    })
  })
})
