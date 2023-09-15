const assert = require('assert')

describe('Tests for schemas utilities', () => {
  describe('getEventId', () => {
    it('Should return the correct ID', async () => {
      const { utils } = require('../..')
      const ret = await utils.getEventId({
        status: 'detected',
        eventName: 'UserOperation',
        nonce: '85671',
        destinationAccount: '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        destinationNetworkId: '0xf9b459a1',
        underlyingAssetName: 'USD//C on xDai',
        underlyingAssetSymbol: 'USDC',
        underlyingAssetDecimals: 6,
        underlyingAssetTokenAddress: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
        underlyingAssetNetworkId: '0xd41b1c5b',
        assetTokenAddress: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
        assetAmount: '1455000000000000',
        userData: '0x',
        optionsMask: '0x0000000000000000000000000000000000000000000000000000000000000000',
        originatingBlockHash: null,
        originatingAddress: null,
        originatingNetworkId: null,
        originatingTransactionHash: null,
        blockHash: '0x2c3f80c427a454df34e9f7b4684cd0767ebe7672db167151369af3f49b9326c4',
        networkId: '0xd41b1c5b',
        transactionHash: '0x2d300f8aeed6cee69f50dde84d0a6e991d0836b2a1a3b3a6737b3ae3493f710f',
        proposedTransactionTimestamp: null,
        proposedTransactionHash: null,
        witnessedTimestamp: '2023-07-27T13:29:43.101Z',
        finalTransactionHash: null,
        finalTransactionTimestamp: null,
        forwardDestinationNetworkId: '0xfc8ebb2b',
        protocolFeeAssetAmount: '0',
        networkFeeAssetAmount: '0',
        forwardNetworkFeeAssetAmount: '0',
      })

      assert.strictEqual(ret, '0x0e629afc57c3f95207c44fee302cedb89c7051b99df35847586b569073e8f425')
    })
  })
})
