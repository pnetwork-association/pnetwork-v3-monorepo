const EventEmitter = require('events')

describe('Tests for the listener interface', () => {
  describe('listenForEvents', () => {
    beforeAll(() => {
      jest.useFakeTimers()
    })

    beforeEach(() => {
      jest.resetAllMocks()
      jest.resetModules()
    })

    afterAll(() => {
      jest.useRealTimers()
    })

    test.each([['0x005fe7f9'], ['0x00e4b170'], ['0x00f1918e'], ['0x0075dd4c']])(
      'Should listen to EVM events for chain id %p',
      async _chainId => {
        const { db } = require('ptokens-utils')
        const evmListener = require('../lib/evm/listener-evm')

        const insertIntoDbSpy = jest
          .spyOn(db, 'insertReport')
          .mockImplementation(() => Promise.resolve())

        const eventEmitter = new EventEmitter()
        const listenForEvmEventsSpy = jest
          .spyOn(evmListener, 'listenForEvmEvents')
          .mockImplementation((_state, _callback) =>
            _state.eventsToListen.map(_event =>
              _event['token-contracts'].map(_address =>
                eventEmitter.on(`${_event.name}/${_address}`, _event =>
                  _callback({ event: _event, address: _address })
                )
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

        listenerInterface.listenForEvents(state)

        setTimeout(
          () => eventEmitter.emit('event1/address1', { block: 1 }),
          200
        )
        setTimeout(
          () => eventEmitter.emit('event1/address2', { block: 2 }),
          400
        )
        setTimeout(
          () => eventEmitter.emit('event2/address3', { block: 3 }),
          600
        )
        setTimeout(
          () => eventEmitter.emit('event1/address1', { block: 4 }),
          800
        )
        setTimeout(
          () => eventEmitter.emit('event2/address4', { block: 5 }),
          1000
        )

        jest.advanceTimersByTime(1200)
        expect(listenForEvmEventsSpy).toHaveBeenCalledTimes(1)
        expect(listenForEvmEventsSpy).toHaveBeenNthCalledWith(
          1,
          state,
          expect.any(Function)
        )
        expect(insertIntoDbSpy).toHaveBeenCalledTimes(5)
        expect(insertIntoDbSpy).toHaveBeenNthCalledWith(1, 'database', {
          address: 'address1',
          event: { block: 1 },
        })
        expect(insertIntoDbSpy).toHaveBeenNthCalledWith(2, 'database', {
          address: 'address2',
          event: { block: 2 },
        })
        expect(insertIntoDbSpy).toHaveBeenNthCalledWith(3, 'database', {
          address: 'address3',
          event: { block: 3 },
        })
        expect(insertIntoDbSpy).toHaveBeenNthCalledWith(4, 'database', {
          address: 'address1',
          event: { block: 4 },
        })
        expect(insertIntoDbSpy).toHaveBeenNthCalledWith(5, 'database', {
          address: 'address4',
          event: { block: 5 },
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
          'Invalid blockchain type'
        )
      }
    )
  })
})
