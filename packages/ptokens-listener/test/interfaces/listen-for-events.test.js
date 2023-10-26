const stateConstants = require('../../lib/state/constants')
const constants = require('ptokens-constants')
const { db } = require('ptokens-utils')

describe('Tests for the listener interface', () => {
  describe('listenForEvents', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })

    const getState = _networkId => ({
      [constants.state.KEY_NETWORK_ID]: _networkId,
      [stateConstants.STATE_KEY_EVENTS]: [
        {
          [constants.config.KEY_SIGNATURES]: ['event1', 'event2'],
          [constants.config.KEY_CONTRACT]: 'address1',
        },
        {
          [constants.config.KEY_SIGNATURES]: ['event3', 'event4'],
          [constants.config.KEY_CONTRACT]: 'address2',
        },
      ],
      [constants.state.KEY_DB]: { database: 'database' },
    })

    test.each([['0xd41b1c5b'], ['0xf9b459a1'], ['0xfc8ebb2b']])(
      'Should listen to EVM events for chain id %p',
      async _networkId => {
        const evmListener = require('../../lib/evm/evm-listen-for-events')

        const insertReportSpy = jest
          .spyOn(db, 'insertReport')
          .mockImplementation(() => Promise.resolve())

        const listenForEvmEventsSpy = jest
          .spyOn(evmListener, 'listenForEvmEvents')
          .mockImplementation((_state, _callback) =>
            _state[stateConstants.STATE_KEY_EVENTS].forEach(_event =>
              _event[constants.config.KEY_SIGNATURES].forEach(_signature =>
                _callback({ event: _signature, address: _event[constants.config.KEY_CONTRACT] })
              )
            )
          )

        const listenerInterface = require('../../lib/interfaces/listen-for-events')
        const state = getState(_networkId)

        await listenerInterface.listenForEvents(state)

        expect(listenForEvmEventsSpy).toHaveBeenCalledTimes(1)
        expect(listenForEvmEventsSpy).toHaveBeenNthCalledWith(1, state, expect.any(Function))
        expect(insertReportSpy).toHaveBeenCalledTimes(4)
        expect(insertReportSpy).toHaveBeenNthCalledWith(
          1,
          { database: 'database' },
          {
            address: 'address1',
            event: 'event1',
          }
        )
        expect(insertReportSpy).toHaveBeenNthCalledWith(
          2,
          { database: 'database' },
          {
            address: 'address1',
            event: 'event2',
          }
        )
        expect(insertReportSpy).toHaveBeenNthCalledWith(
          3,
          { database: 'database' },
          {
            address: 'address2',
            event: 'event3',
          }
        )
        expect(insertReportSpy).toHaveBeenNthCalledWith(
          4,
          { database: 'database' },
          {
            address: 'address2',
            event: 'event4',
          }
        )
      }
    )

    // test.each([['0x03c38e67']])(
    //   'Should reject for the not-supported Algorand chain ID %p',
    //   async _networkId => {
    //     const listenerInterface = require('../../lib/interfaces/listen-for-events')
    //     const state = getState(_networkId)
    //     expect(() => listenerInterface.listenForEvents(state)).rejects.toThrow('To be implemented!')
    //   }
    // )

    // test.each([['0x02e7261c']])(
    //   'Should reject for the not-supported EOSIO chain ID %p',
    //   async _networkId => {
    //     const listenerInterface = require('../../lib/interfaces/listen-for-events')
    //     const state = getState(_networkId)
    //     expect(() => listenerInterface.listenForEvents(state)).rejects.toThrow('To be implemented!')
    //   }
    // )

    // test.each([['0x01ec97de']])(
    //   'Should reject for the not-supported UTXO chain ID %p',
    //   async _networkId => {
    //     const listenerInterface = require('../../lib/interfaces/listen-for-events')
    //     const state = getState(_networkId)
    //     expect(() => listenerInterface.listenForEvents(state)).rejects.toThrow('To be implemented!')
    //   }
    // )

    test.each([['0x12345678']])(
      'Should reject when using an unsupported chain ID',
      async _networkId => {
        const listenerInterface = require('../../lib/interfaces/listen-for-events')
        const state = getState(_networkId)
        expect(() => listenerInterface.listenForEvents(state)).rejects.toThrow(
          'Unknown chain ID 0x12345678'
        )
      }
    )
  })
})
