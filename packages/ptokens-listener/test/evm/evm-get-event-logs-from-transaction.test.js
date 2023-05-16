const ethers = require('ethers')
const constants = require('ptokens-constants')
const { receipts } = require('../mock/evm-receipts')

describe('Get EVM event logs', () => {
  describe('getEvmEventLogsFromTransaction', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('Should get event logs for a transaction', async () => {
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
        getEvmEventLogsFromTransaction,
      } = require('../../lib/evm/evm-get-event-logs-from-transaction')
      const provider = 'mumbai-provider-url-1'
      const txHash = '0x1091be7256f91c7025906b4cd82332e3b7d671c8ef60df08c14dc06fa11cf49a'
      const ret = await getEvmEventLogsFromTransaction(provider, txHash)
      expect(getDefaultProviderSpy).toHaveBeenNthCalledWith(1, provider)
      expect(getTransactionReceiptSpy).toHaveBeenNthCalledWith(1, txHash)
      expect(ret).toStrictEqual(receipts[0].logs)
    })

    it('Should get log for a particular event in a transaction', async () => {
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
        getEvmEventLogsFromTransaction,
      } = require('../../lib/evm/evm-get-event-logs-from-transaction')
      const provider = 'mumbai-provider-url-2'
      const txHash = '0x1091be7256f91c7025906b4cd82332e3b7d671c8ef60df08c14dc06fa11cf49a'
      const ret = await getEvmEventLogsFromTransaction(
        provider,
        txHash,
        constants.evm.events.OPERATION_EXECUTED_SIGNATURE
      )
      expect(getDefaultProviderSpy).toHaveBeenNthCalledWith(1, provider)
      expect(getTransactionReceiptSpy).toHaveBeenNthCalledWith(1, txHash)
      expect(ret).toStrictEqual([receipts[0].logs[1]])
    })
  })
})
