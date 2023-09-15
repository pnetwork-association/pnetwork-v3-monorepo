const ethers = require('ethers')
const constants = require('ptokens-constants')
const { receipts } = require('../mock/evm-receipts')

describe('Get EVM event reports', () => {
  describe('getEvmEventReportsFromTransaction', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })
    afterEach(() => {
      jest.useRealTimers()
    })
    it('Should get event reports for a transaction', async () => {
      jest.useFakeTimers({ now: Date.parse('2023-05-18T07:35:54.575Z') })
      const getTransactionReceiptSpy = jest
        .spyOn(ethers.AbstractProvider.prototype, 'getTransactionReceipt')
        .mockResolvedValue(receipts[0])
      const fakeProvider = {
        getTransactionReceipt: getTransactionReceiptSpy,
      }
      const getDefaultProviderSpy = jest
        .spyOn(ethers, 'getDefaultProvider')
        .mockImplementation(_url => fakeProvider)

      const {
        getEvmEventReportsFromTransaction,
      } = require('../../lib/evm/evm-get-event-reports-from-transaction')
      const provider = 'polygon-provider-url-1'
      const networkId = 'polygon-network-id'
      const txHash = '0x260d51e9aac08601fb948b137b41a672244efbf72b8c107949937dcec8bd3175'
      const ret = await getEvmEventReportsFromTransaction(
        provider,
        networkId,
        txHash,
        constants.evm.events.OPERATION_EXECUTED_SIGNATURE
      )
      expect(getDefaultProviderSpy).toHaveBeenNthCalledWith(1, provider)
      expect(getTransactionReceiptSpy).toHaveBeenNthCalledWith(1, txHash)
      expect(ret).toStrictEqual([
        {
          _id: 'operationexecuted_0x0e629afc57c3f95207c44fee302cedb89c7051b99df35847586b569073e8f425',
          status: 'detected',
          eventName: 'OperationExecuted',
          nonce: '85671',
          destinationAccount: '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
          destinationNetworkId: '0xf9b459a1',
          underlyingAssetName: 'USD//C on xDai',
          underlyingAssetSymbol: 'USDC',
          underlyingAssetDecimals: 6,
          underlyingAssetTokenAddress: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
          underlyingAssetNetworkId: '0xd41b1c5b',
          assetTokenAddress: null,
          assetAmount: '1455000000000000',
          userData: '0x',
          optionsMask: '0x0000000000000000000000000000000000000000000000000000000000000000',
          originatingBlockHash:
            '0x2c3f80c427a454df34e9f7b4684cd0767ebe7672db167151369af3f49b9326c4',
          originatingAddress: null,
          originatingNetworkId: '0xd41b1c5b',
          originatingTransactionHash:
            '0x2d300f8aeed6cee69f50dde84d0a6e991d0836b2a1a3b3a6737b3ae3493f710f',
          blockHash: '0xf402531eeaafe0e208e76b14dc0f6dc0f8bb6db78da57e523e4caac768c8cbe9',
          networkId,
          transactionHash: txHash,
          proposedTransactionTimestamp: null,
          proposedTransactionHash: null,
          witnessedTimestamp: '2023-05-18T07:35:54.575Z',
          finalTransactionHash: null,
          finalTransactionTimestamp: null,
          forwardDestinationNetworkId: '0xfc8ebb2b',
          forwardNetworkFeeAssetAmount: '0',
          networkFeeAssetAmount: '0',
          protocolFeeAssetAmount: '0',
        },
      ])
    })
  })
})
