describe('Tests for the listener interface', () => {
  describe('listenForEvents', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      jest.resetModules()
    })

    test.each([['0x005fe7f9'], ['0x00e4b170'], ['0x00f1918e'], ['0x0075dd4c']])(
      'Should listen to EVM events for chain id %p',
      async _chainId => {
        const { db } = require('ptokens-utils')
        const evmListener = require('../lib/evm/listener-evm')

        const insertIntoDbSpy = jest
          .spyOn(db, 'insertReport')
          .mockImplementation(() => Promise.resolve())

        const listenForEvmEventsSpy = jest
          .spyOn(evmListener, 'listenForEvmEvents')
          .mockImplementation((_state, _callback) =>
            _state.eventsToListen.forEach(_event =>
              _event['token-contracts'].forEach(_address =>
                _callback({ event: _event.name, address: _address })
              )
            )
          )

        const listenerInterface = require('../lib/listener-interface')
        const state = {
          'chain-id': _chainId,
          eventsToListen: [
            {
              name: 'event1',
              'token-contracts': ['address1', 'address2'],
            },
            {
              name: 'event2',
              'token-contracts': ['address3', 'address4'],
            },
          ],
          database: 'database',
        }

        await listenerInterface.listenForEvents(state)

        expect(listenForEvmEventsSpy).toHaveBeenCalledTimes(1)
        expect(listenForEvmEventsSpy).toHaveBeenNthCalledWith(
          1,
          state,
          expect.any(Function)
        )
        expect(insertIntoDbSpy).toHaveBeenCalledTimes(4)
        expect(insertIntoDbSpy).toHaveBeenNthCalledWith(1, 'database', {
          address: 'address1',
          event: 'event1',
        })
        expect(insertIntoDbSpy).toHaveBeenNthCalledWith(2, 'database', {
          address: 'address2',
          event: 'event1',
        })
        expect(insertIntoDbSpy).toHaveBeenNthCalledWith(3, 'database', {
          address: 'address3',
          event: 'event2',
        })
        expect(insertIntoDbSpy).toHaveBeenNthCalledWith(4, 'database', {
          address: 'address4',
          event: 'event2',
        })
      }
    )

    test.each([['0x03c38e67']])(
      'Should reject for the not-supported Algorand chain ID %p',
      async _chainId => {
        const listenerInterface = require('../lib/listener-interface')
        const state = {
          'chain-id': _chainId,
          eventsToListen: [
            {
              name: 'event1',
              'token-contracts': ['address1'],
            },
            {
              name: 'event2',
              'token-contracts': ['address2'],
            },
          ],
          database: 'database',
        }
        expect(() => listenerInterface.listenForEvents(state)).rejects.toThrow(
          'To be implemented!'
        )
      }
    )

    test.each([['0x02e7261c']])(
      'Should reject for the not-supported EOSIO chain ID %p',
      async _chainId => {
        const listenerInterface = require('../lib/listener-interface')
        const state = {
          'chain-id': _chainId,
          eventsToListen: [
            {
              name: 'event1',
              'token-contracts': ['address1'],
            },
            {
              name: 'event2',
              'token-contracts': ['address2'],
            },
          ],
          database: 'database',
        }
        expect(() => listenerInterface.listenForEvents(state)).rejects.toThrow(
          'To be implemented!'
        )
      }
    )

    test.each([['0x01ec97de']])(
      'Should reject for the not-supported UTXO chain ID %p',
      async _chainId => {
        const listenerInterface = require('../lib/listener-interface')
        const state = {
          'chain-id': _chainId,
          eventsToListen: [
            {
              name: 'event1',
              'token-contracts': ['address1'],
            },
            {
              name: 'event2',
              'token-contracts': ['address2'],
            },
          ],
          database: 'database',
        }
        expect(() => listenerInterface.listenForEvents(state)).rejects.toThrow(
          'To be implemented!'
        )
      }
    )

    test.each([['0x12345678']])(
      'Should reject when using an unsupported chain ID',
      async _chainId => {
        const listenerInterface = require('../lib/listener-interface')
        const state = {
          'chain-id': _chainId,
          eventsToListen: [
            {
              name: 'event1',
              'token-contracts': ['address1'],
            },
            {
              name: 'event2',
              'token-contracts': ['address2'],
            },
          ],
          database: 'database',
        }
        expect(() => listenerInterface.listenForEvents(state)).rejects.toThrow(
          'Unknown chain ID 0x12345678'
        )
      }
    )
  })
})
