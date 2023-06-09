describe('Tests for the getOperationsById interface', () => {
  describe('getOperationsById', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      jest.resetModules()
    })

    test.each([['0x005fe7f9'], ['0x00e4b170'], ['0x00f1918e'], ['0xf9b459a1']])(
      'Should get operations linked to Operation ID for chain id %p',
      async _networkId => {
        const getOperationsModule = require('../../lib/evm/evm-get-operations-by-id')

        const getEvmOperationsByIdSpy = jest
          .spyOn(getOperationsModule, 'getEvmOperationsById')
          .mockResolvedValue()

        const getOperationsByIdInterface = require('../../lib/interfaces/get-operations-by-id')

        await getOperationsByIdInterface.getOperationsById(
          'provider-url',
          _networkId,
          'tx-hash',
          'event',
          123456
        )

        expect(getEvmOperationsByIdSpy).toHaveBeenCalledTimes(1)
        expect(getEvmOperationsByIdSpy).toHaveBeenNthCalledWith(
          1,
          'provider-url',
          _networkId,
          'tx-hash',
          'event',
          123456
        )
      }
    )

    test.each([['0x03c38e67']])(
      'Should reject for the not-supported Algorand chain ID %p',
      async _networkId => {
        const { getOperationsById } = require('../../lib/interfaces/get-operations-by-id')
        expect(() =>
          getOperationsById('provider-url', _networkId, 'tx-hash', 'event')
        ).rejects.toThrow('To be implemented!')
      }
    )

    test.each([['0x02e7261c']])(
      'Should reject for the not-supported EOSIO chain ID %p',
      async _networkId => {
        const { getOperationsById } = require('../../lib/interfaces/get-operations-by-id')
        expect(() =>
          getOperationsById('provider-url', _networkId, 'tx-hash', 'event')
        ).rejects.toThrow('To be implemented!')
      }
    )

    test.each([['0x01ec97de']])(
      'Should reject for the not-supported UTXO chain ID %p',
      async _networkId => {
        const { getOperationsById } = require('../../lib/interfaces/get-operations-by-id')
        expect(() =>
          getOperationsById('provider-url', _networkId, 'tx-hash', 'event')
        ).rejects.toThrow('To be implemented!')
      }
    )

    test.each([['0x12345678']])(
      'Should reject when using an unsupported chain ID',
      async _networkId => {
        const { getOperationsById } = require('../../lib/interfaces/get-operations-by-id')
        expect(() =>
          getOperationsById('provider-url', _networkId, 'tx-hash', 'event')
        ).rejects.toThrow('Unknown chain ID 0x12345678')
      }
    )
  })
})
