const ethers = require('ethers')
const constants = require('ptokens-constants')
const utils = require('ptokens-utils')
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
      const networkId = utils.constants.networkIds.POLYGON_MAINNET
      const txHash = '0xa5c5838123aa37d2efd69285f7b6bd8c2e93d4cf243d45926169502c13b23a49'
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
          _id: 'operationexecuted_0xd9feb6e60cd73c396cbaeb3e5fa55c774c03a274c54f5bc53a62a59855ec7cc4',
          status: 'detected',
          eventName: 'OperationExecuted',
          nonce: '98322',
          destinationAccount: '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
          destinationNetworkId: '0xf9b459a1',
          underlyingAssetName: 'pNetwork Token',
          underlyingAssetSymbol: 'PNT',
          underlyingAssetDecimals: 18,
          underlyingAssetTokenAddress: '0xdaacB0Ab6Fb34d24E8a67BfA14BF4D95D4C7aF92',
          underlyingAssetNetworkId: '0x5aca268b',
          assetTokenAddress: null,
          assetAmount: '200000',
          userData: '0x',
          optionsMask: '0x0000000000000000000000000000000000000000000000000000000000000000',
          originatingBlockHash:
            '0x05cf0e83408207704ee0ea2a4a6ea87905fc0d2038dbb610a0ca64f2cf47b134',
          originatingAddress: '0xddb5f4535123daa5ae343c24006f4075abaf5f7b',
          originatingNetworkId: '0x5aca268b',
          originatingTransactionHash:
            '0xb1bb8b6502edc17fdd0cc83505289a6d429a6381ffe5dbf4fe31a88dd236d643',
          blockHash: '0x0fc3588f727dde10ccd937b04f5666fb04e39553b4c73719555acd7a6a430764',
          networkId,
          transactionHash: txHash,
          proposedTransactionTimestamp: null,
          proposedTransactionHash: null,
          witnessedTimestamp: '2023-05-18T07:35:54.575Z',
          finalTransactionHash: null,
          finalTransactionTimestamp: null,
          forwardDestinationNetworkId: '0xb9286154',
          forwardNetworkFeeAssetAmount: '2000',
          networkFeeAssetAmount: '1000',
          protocolFeeAssetAmount: '0',
          isForProtocol: false,
        },
      ])
    })
  })
})
