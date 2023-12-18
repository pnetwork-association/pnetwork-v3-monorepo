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
        .spyOn(ethers.providers.JsonRpcProvider.prototype, 'getTransactionReceipt')
        .mockResolvedValue(receipts[0])
      const fakeProvider = {
        getTransactionReceipt: getTransactionReceiptSpy,
      }
      const getDefaultProviderSpy = jest
        .spyOn(ethers.providers, 'JsonRpcProvider')
        .mockImplementation(_url => fakeProvider)

      const {
        getEvmEventReportsFromTransaction,
      } = require('../../lib/evm/evm-get-event-reports-from-transaction')
      const provider = 'polygon-provider-url-1'
      const networkId = constants.networkIds.POLYGON_MAINNET
      const txHash = '0xa5c5838123aa37d2efd69285f7b6bd8c2e93d4cf243d45926169502c13b23a49' // secretlint-disable-line
      const ret = await getEvmEventReportsFromTransaction(
        provider,
        networkId,
        txHash,
        constants.evm.events.OPERATION_EXECUTED_SIGNATURE
      )
      expect(getDefaultProviderSpy).toHaveBeenNthCalledWith(1, provider)
      expect(getTransactionReceiptSpy).toHaveBeenNthCalledWith(1, txHash)
      expect(ret).toMatchSnapshot()
    })
  })
})
