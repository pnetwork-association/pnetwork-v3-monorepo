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
      const provider = 'mumbai-provider-url-1'
      const networkId = 'network-id'
      const txHash = '0x1091be7256f91c7025906b4cd82332e3b7d671c8ef60df08c14dc06fa11cf49a'
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
          status: 'detected',
          eventName: 'OperationExecuted',
          nonce: '6911',
          destinationAccount: '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
          destinationNetworkId: '0xadc11660',
          underlyingAssetName: 'Token',
          underlyingAssetSymbol: 'TKN',
          underlyingAssetDecimals: 18,
          underlyingAssetTokenAddress: '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
          underlyingAssetNetworkId: '0xe15503e4',
          assetTokenAddress: null,
          assetAmount: '7000000000000000000',
          userData: '0xc0ffee',
          optionsMask: '0x0000000000000000000000000000000000000000000000000000000000000000',
          originatingBlockHash:
            '0x0a28ad43b419dc33044b0a27922be4bd382a4ee176432acddbea54920ec9f0cb',
          originatingAddress: null,
          originatingNetworkId: '0xe15503e4',
          originatingTransactionHash:
            '0x8a912c26b9c85ea37779d75ae37abe6c4b24c21b811b2841b2f35d89a979bdc2',
          blockHash: '0x2fd646a16bc1d757644aac896a56304f4a6fc15f622aa85f684b6abf411ac521',
          networkId,
          transactionHash: '0x1091be7256f91c7025906b4cd82332e3b7d671c8ef60df08c14dc06fa11cf49a',
          proposedTransactionTimestamp: null,
          proposedTransactionHash: null,
          witnessedTimestamp: '2023-05-18T07:35:54.575Z',
          finalTransactionHash: null,
          finalTransactionTimestamp: null,
          _id: 'operationexecuted_0x03fe2896685c353a09d980093517477647863d14f8f0aa4d3dc73761a4615bbf',
        },
      ])
    })
  })
})
