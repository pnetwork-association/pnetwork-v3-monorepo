const stateConstants = require('../lib/state/constants')
const { constants: ptokensUtilsConstants } = require('ptokens-utils')
const schemas = require('ptokens-schemas')

describe('Tests for the listener interface', () => {
  describe('listenForEvents', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      jest.resetModules()
    })

    const getState = _chainId => ({
      [ptokensUtilsConstants.STATE_KEY_CHAIN_ID]: _chainId,
      [stateConstants.STATE_KEY_EVENTS]: [
        {
          [schemas.constants.SCHEMA_NAME_KEY]: 'event1',
          [schemas.constants.SCHEMA_TOKEN_CONTRACTS_KEY]: [
            'address1',
            'address2',
          ],
        },
        {
          [schemas.constants.SCHEMA_NAME_KEY]: 'event2',
          [schemas.constants.SCHEMA_TOKEN_CONTRACTS_KEY]: [
            'address3',
            'address4',
          ],
        },
      ],
      [ptokensUtilsConstants.STATE_KEY_DB]: { database: 'database' },
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
            _state[stateConstants.STATE_KEY_EVENTS].forEach(_event =>
              _event[schemas.constants.SCHEMA_TOKEN_CONTRACTS_KEY].forEach(
                _address => _callback({ event: _event.name, address: _address })
              )
            )
          )

        const listenerInterface = require('../lib/listener-interface')
        const state = getState(_chainId)

        await listenerInterface.listenForEvents(state)

        expect(listenForEvmEventsSpy).toHaveBeenCalledTimes(1)
        expect(listenForEvmEventsSpy).toHaveBeenNthCalledWith(
          1,
          state,
          expect.any(Function)
        )
        expect(insertIntoDbSpy).toHaveBeenCalledTimes(4)
        expect(insertIntoDbSpy).toHaveBeenNthCalledWith(
          1,
          { database: 'database' },
          {
            address: 'address1',
            event: 'event1',
          }
        )
        expect(insertIntoDbSpy).toHaveBeenNthCalledWith(
          2,
          { database: 'database' },
          {
            address: 'address2',
            event: 'event1',
          }
        )
        expect(insertIntoDbSpy).toHaveBeenNthCalledWith(
          3,
          { database: 'database' },
          {
            address: 'address3',
            event: 'event2',
          }
        )
        expect(insertIntoDbSpy).toHaveBeenNthCalledWith(
          4,
          { database: 'database' },
          {
            address: 'address4',
            event: 'event2',
          }
        )
      }
    )

    test.each([['0x03c38e67']])(
      'Should reject for the not-supported Algorand chain ID %p',
      async _chainId => {
        const listenerInterface = require('../lib/listener-interface')
        const state = getState(_chainId)
        expect(() => listenerInterface.listenForEvents(state)).rejects.toThrow(
          'To be implemented!'
        )
      }
    )

    test.each([['0x02e7261c']])(
      'Should reject for the not-supported EOSIO chain ID %p',
      async _chainId => {
        const listenerInterface = require('../lib/listener-interface')
        const state = getState(_chainId)
        expect(() => listenerInterface.listenForEvents(state)).rejects.toThrow(
          'To be implemented!'
        )
      }
    )

    test.each([['0x01ec97de']])(
      'Should reject for the not-supported UTXO chain ID %p',
      async _chainId => {
        const listenerInterface = require('../lib/listener-interface')
        const state = getState(_chainId)
        expect(() => listenerInterface.listenForEvents(state)).rejects.toThrow(
          'To be implemented!'
        )
      }
    )

    test.each([['0x12345678']])(
      'Should reject when using an unsupported chain ID',
      async _chainId => {
        const listenerInterface = require('../lib/listener-interface')
        const state = getState(_chainId)
        expect(() => listenerInterface.listenForEvents(state)).rejects.toThrow(
          'Unknown chain ID 0x12345678'
        )
      }
    )
  })
})
