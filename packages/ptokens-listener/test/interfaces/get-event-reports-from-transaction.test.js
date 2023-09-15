describe('Tests for the getEventReportsFromTransaction interface', () => {
  describe('getEventReportsFromTransaction', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      jest.resetModules()
    })

    test.each([['0xd41b1c5b'], ['0xf9b459a1'], ['0xfc8ebb2b']])(
      'Should get event reports from EVM events for chain id %p',
      async _networkId => {
        const getEventReportsModule = require('../../lib/evm/evm-get-event-reports-from-transaction')

        const getEvmEventReportsFromTransactionSpy = jest
          .spyOn(getEventReportsModule, 'getEvmEventReportsFromTransaction')
          .mockResolvedValue()

        const getEventReportsFromTransactionInterface = require('../../lib/interfaces/get-event-reports-from-transaction')

        await getEventReportsFromTransactionInterface.getEventReportsFromTransaction(
          'provider-url',
          _networkId,
          'tx-hash',
          'event'
        )

        expect(getEvmEventReportsFromTransactionSpy).toHaveBeenCalledTimes(1)
        expect(getEvmEventReportsFromTransactionSpy).toHaveBeenNthCalledWith(
          1,
          'provider-url',
          _networkId,
          'tx-hash',
          'event'
        )
      }
    )

    // test.each([['0x03c38e67']])(
    //   'Should reject for the not-supported Algorand chain ID %p',
    //   async _networkId => {
    //     const {
    //       getEventReportsFromTransaction,
    //     } = require('../../lib/interfaces/get-event-reports-from-transaction')
    //     expect(() =>
    //       getEventReportsFromTransaction('provider-url', _networkId, 'tx-hash', 'event')
    //     ).rejects.toThrow('To be implemented!')
    //   }
    // )

    // test.each([['0x02e7261c']])(
    //   'Should reject for the not-supported EOSIO chain ID %p',
    //   async _networkId => {
    //     const {
    //       getEventReportsFromTransaction,
    //     } = require('../../lib/interfaces/get-event-reports-from-transaction')
    //     expect(() =>
    //       getEventReportsFromTransaction('provider-url', _networkId, 'tx-hash', 'event')
    //     ).rejects.toThrow('To be implemented!')
    //   }
    // )

    // test.each([['0x01ec97de']])(
    //   'Should reject for the not-supported UTXO chain ID %p',
    //   async _networkId => {
    //     const {
    //       getEventReportsFromTransaction,
    //     } = require('../../lib/interfaces/get-event-reports-from-transaction')
    //     expect(() =>
    //       getEventReportsFromTransaction('provider-url', _networkId, 'tx-hash', 'event')
    //     ).rejects.toThrow('To be implemented!')
    //   }
    // )

    test.each([['0x12345678']])(
      'Should reject when using an unsupported chain ID',
      async _networkId => {
        const {
          getEventReportsFromTransaction,
        } = require('../../lib/interfaces/get-event-reports-from-transaction')
        expect(() =>
          getEventReportsFromTransaction('provider-url', _networkId, 'tx-hash', 'event')
        ).rejects.toThrow('Unknown chain ID 0x12345678')
      }
    )
  })
})
