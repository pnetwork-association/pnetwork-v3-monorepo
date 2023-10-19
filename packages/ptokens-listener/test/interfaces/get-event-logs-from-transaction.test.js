describe('Tests for the getEventLogsFromTransaction interface', () => {
  describe('getEventLogsFromTransaction', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })

    test.each([['0xd41b1c5b'], ['0xf9b459a1'], ['0xfc8ebb2b']])(
      'Should get EVM event logs for chain id %p',
      async _networkId => {
        const getEventLogsModule = require('../../lib/evm/evm-get-event-logs-from-transaction')

        const listenForEvmEventsSpy = jest
          .spyOn(getEventLogsModule, 'getEvmEventLogsFromTransaction')
          .mockResolvedValue()

        const getEventLogsFromTransactionInterface = require('../../lib/interfaces/get-event-logs-from-transaction')

        await getEventLogsFromTransactionInterface.getEventLogsFromTransaction(
          'provider-url',
          _networkId,
          'tx-hash',
          'event'
        )

        expect(listenForEvmEventsSpy).toHaveBeenCalledTimes(1)
        expect(listenForEvmEventsSpy).toHaveBeenNthCalledWith(1, 'provider-url', 'tx-hash', 'event')
      }
    )

    // test.each([['0x03c38e67']])(
    //   'Should reject for the not-supported Algorand chain ID %p',
    //   async _networkId => {
    //     const {
    //       getEventLogsFromTransaction,
    //     } = require('../../lib/interfaces/get-event-logs-from-transaction')
    //     expect(() =>
    //       getEventLogsFromTransaction('provider-url', _networkId, 'tx-hash', 'event')
    //     ).rejects.toThrow('To be implemented!')
    //   }
    // )

    // test.each([['0x02e7261c']])(
    //   'Should reject for the not-supported EOSIO chain ID %p',
    //   async _networkId => {
    //     const {
    //       getEventLogsFromTransaction,
    //     } = require('../../lib/interfaces/get-event-logs-from-transaction')
    //     expect(() =>
    //       getEventLogsFromTransaction('provider-url', _networkId, 'tx-hash', 'event')
    //     ).rejects.toThrow('To be implemented!')
    //   }
    // )

    // test.each([['0x01ec97de']])(
    //   'Should reject for the not-supported UTXO chain ID %p',
    //   async _networkId => {
    //     const {
    //       getEventLogsFromTransaction,
    //     } = require('../../lib/interfaces/get-event-logs-from-transaction')
    //     expect(() =>
    //       getEventLogsFromTransaction('provider-url', _networkId, 'tx-hash', 'event')
    //     ).rejects.toThrow('To be implemented!')
    //   }
    // )

    test.each([['0x12345678']])(
      'Should reject when using an unsupported chain ID',
      async _networkId => {
        const {
          getEventLogsFromTransaction,
        } = require('../../lib/interfaces/get-event-logs-from-transaction')
        expect(() =>
          getEventLogsFromTransaction('provider-url', _networkId, 'tx-hash', 'event')
        ).rejects.toThrow('Unknown chain ID 0x12345678')
      }
    )
  })
})
