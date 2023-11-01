const EventEmitter = require('events')
const ethers = require('ethers')
const { logs } = require('../mock/evm-logs')
const constants = require('ptokens-constants')

const { STATE_KEY_EVENTS } = require('../../lib/state/constants')

describe('EVM listen for events', () => {
  describe('listenForEvmEvents', () => {
    beforeEach(() => {
      jest.restoreAllMocks()
    })
    afterEach(() => {
      jest.useRealTimers()
    })

    it('Should call callback with the standardized event', async () => {
      jest.useFakeTimers({ now: Date.parse('2023-05-18T07:35:54.575Z') })
      const state = {
        [constants.state.KEY_NETWORK_ID]: '0xf9b459a1',
        [constants.state.KEY_PROVIDER_URL]: 'provider-url',
        [STATE_KEY_EVENTS]: [
          {
            [constants.config.KEY_SIGNATURES]: [
              'Transfer(address indexed from,address indexed to,uint256 value)',
            ],
            [constants.config.KEY_CONTRACT]: '0xdac17f958d2ee523a2206206994597c13d831ec7',
          },
          {
            [constants.config.KEY_SIGNATURES]: [
              constants.evm.events.USER_OPERATION_SIGNATURE,
              constants.evm.events.OPERATION_QUEUED_SIGNATURE,
            ],
            [constants.config.KEY_CONTRACT]: '0xd2bac275fffdbdd23ecea72f4b161b3af90300a3',
          },
        ],
      }
      const fakeProvider = new EventEmitter()
      fakeProvider._on = fakeProvider.on

      const onListenerSpy = jest
        .spyOn(fakeProvider, 'on')
        .mockImplementationOnce((_filter, _func) => _func(logs[3]))
        .mockImplementationOnce((_filter, _func) =>
          _func(logs[1]).then(_ =>
            // exit from the never-ending listenForEvmEvents
            Promise.reject(new Error('terminate'))
          )
        )
      const getDefaultProviderSpy = jest
        .spyOn(ethers.providers, 'JsonRpcProvider')
        .mockImplementation(_url => fakeProvider)
      const { listenForEvmEvents } = require('../../lib/evm/evm-listen-for-events')
      const callback = jest.fn()

      try {
        await listenForEvmEvents(state, callback)
      } catch (_err) {
        if (_err.message === 'terminate') {
          expect(getDefaultProviderSpy).toHaveBeenNthCalledWith(1, 'provider-url')
          expect(onListenerSpy).toHaveBeenCalledTimes(2)
          expect(onListenerSpy.mock.calls).toMatchSnapshot()
          expect(callback).toHaveBeenCalledTimes(2)
          expect(callback.mock.calls).toMatchSnapshot()
        } else throw _err
      }
    })
  })
})
