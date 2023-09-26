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
      const provider = 'polygon-provider-url-1'
      const txHash = '0xa5c5838123aa37d2efd69285f7b6bd8c2e93d4cf243d45926169502c13b23a49'
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
      const provider = 'polygon-provider-url-2'
      const txHash = '0xa5c5838123aa37d2efd69285f7b6bd8c2e93d4cf243d45926169502c13b23a49'
      const ret = await getEvmEventLogsFromTransaction(
        provider,
        txHash,
        constants.evm.events.OPERATION_EXECUTED_SIGNATURE
      )
      expect(getDefaultProviderSpy).toHaveBeenNthCalledWith(1, provider)
      expect(getTransactionReceiptSpy).toHaveBeenNthCalledWith(1, txHash)
      expect(ret).toStrictEqual([receipts[0].logs[8]])
    })
  })
})
