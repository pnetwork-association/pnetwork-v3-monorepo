const EventEmitter = require('events')
const ethers = require('ethers')
const { logs } = require('../mock/evm-logs')
const constants = require('ptokens-constants')

const { STATE_KEY_EVENTS } = require('../../lib/state/constants')

const ISO_FORMAT_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/

describe('EVM listen for events', () => {
  describe('listenForEvmEvents', () => {
    beforeEach(() => {
      jest.restoreAllMocks()
    })

    it('Should call callback with the standardized event', async () => {
      const state = {
        [constants.state.KEY_NETWORK_ID]: '0xf9b459a1',
        [constants.state.KEY_PROVIDER_URL]: 'provider-url',
        [STATE_KEY_EVENTS]: [
          {
            [constants.config.KEY_NAME]:
              'Transfer(address indexed from,address indexed to,uint256 value)',
            [constants.config.KEY_CONTRACTS]: ['0xdac17f958d2ee523a2206206994597c13d831ec7'],
          },
          {
            [constants.config.KEY_NAME]: constants.evm.events.USER_OPERATION_SIGNATURE,
            [constants.config.KEY_CONTRACTS]: ['0xd2bac275fffdbdd23ecea72f4b161b3af90300a3'],
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
          expect(onListenerSpy).toHaveBeenNthCalledWith(
            1,
            {
              address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
              topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'], // secretlint-disable-line
            },
            expect.anything()
          )
          expect(onListenerSpy).toHaveBeenNthCalledWith(
            2,
            {
              address: '0xd2bac275fffdbdd23ecea72f4b161b3af90300a3',
              topics: ['0x71d1a48fb10648c4ca31c3abd9a916f0f6545176b2387214ed134a71c924e79f'], // secretlint-disable-line
            },
            expect.anything()
          )

          expect(callback).toHaveBeenCalledTimes(2)
          expect(callback).toHaveBeenNthCalledWith(1, {
            [constants.db.KEY_ID]:
              'transfer_0xc43c1614b094019835a81f1f889a679e109dd5efe2542c1050888f77985feeb1', // secretlint-disable-line
            [constants.db.KEY_STATUS]: constants.db.txStatus.DETECTED,
            [constants.db.KEY_ASSET_AMOUNT]: '200000000',
            [constants.db.KEY_USER_DATA]: null,
            [constants.db.KEY_EVENT_NAME]: 'Transfer',
            [constants.db.KEY_EVENT_ARGS]: expect.any(Array),
            [constants.db.KEY_ASSET_TOKEN_ADDRESS]: null,
            [constants.db.KEY_PROPOSAL_TS]: null,
            [constants.db.KEY_PROPOSAL_TX_HASH]: null,
            [constants.db.KEY_PROTOCOL_FEE_ASSET_AMOUNT]: null,
            [constants.db.KEY_WITNESSED_TS]: expect.stringMatching(ISO_FORMAT_REGEX),
            [constants.db.KEY_FINAL_TX_HASH]: null,
            [constants.db.KEY_FINAL_TX_TS]: null,
            [constants.db.KEY_IS_FOR_PROTOCOL]: null,
            [constants.db.KEY_FORWARD_DESTINATION_NETWORK_ID]: null,
            [constants.db.KEY_FORWARD_NETWORK_FEE_ASSET_AMOUNT]: null,
            [constants.db.KEY_NETWORK_FEE_ASSET_AMOUNT]: null,
            [constants.db.KEY_OPTIONS_MASK]: null,
            [constants.db.KEY_NONCE]: null,
            [constants.db.KEY_DESTINATION_ACCOUNT]: '0x31c43E2be5BCd4EDb512aD47A0F1A93aA22941b9',
            [constants.db.KEY_DESTINATION_NETWORK_ID]: null,
            [constants.db.KEY_UNDERLYING_ASSET_NAME]: null,
            [constants.db.KEY_UNDERLYING_ASSET_SYMBOL]: null,
            [constants.db.KEY_UNDERLYING_ASSET_DECIMALS]: null,
            [constants.db.KEY_UNDERLYING_ASSET_TOKEN_ADDRESS]: null,
            [constants.db.KEY_UNDERLYING_ASSET_NETWORK_ID]: null,
            [constants.db.KEY_ORIGINATING_ADDRESS]: '0xd8a7346Ffef357542857aB5fCF7ed1baED08680f',
            [constants.db.KEY_ORIGINATING_NETWORK_ID]: null,
            [constants.db.KEY_ORIGINATING_TX_HASH]: null,
            [constants.db.KEY_ORIGINATING_BLOCK_HASH]: null,
            [constants.db.KEY_NETWORK_ID]: '0xf9b459a1',
            [constants.db.KEY_BLOCK_HASH]:
              '0x460635ecc1efa7230644fe6c2c01635f873663e81afc8c727947da5560ed12e5', // secretlint-disable-line
            [constants.db.KEY_TX_HASH]:
              '0x37eeb55eab329c73aeac6a172faa6c77e7013cd0cda0fc472274c5faf0df7003', // secretlint-disable-line
          })

          expect(callback).toHaveBeenNthCalledWith(2, {
            [constants.db.KEY_ID]:
              'useroperation_0x22e7253e862e3e1d4b59570bd796c3ff8c56e773f991529795605d6db8999fc0', // secretlint-disable-line
            [constants.db.KEY_STATUS]: constants.db.txStatus.DETECTED,
            [constants.db.KEY_EVENT_NAME]: constants.db.eventNames.USER_OPERATION,

            [constants.db.KEY_NONCE]: '88418',
            [constants.db.KEY_ASSET_AMOUNT]: '100000000000',
            [constants.db.KEY_EVENT_ARGS]: expect.any(Array),
            [constants.db.KEY_DESTINATION_ACCOUNT]: '0xa41657bf225F8Ec7E2010C89c3F084172948264D',
            [constants.db.KEY_DESTINATION_NETWORK_ID]: '0xf9b459a1',

            [constants.db.KEY_FINAL_TX_HASH]: null,
            [constants.db.KEY_FINAL_TX_TS]: null,
            [constants.db.KEY_FORWARD_DESTINATION_NETWORK_ID]: '0x5aca268b',
            [constants.db.KEY_FORWARD_NETWORK_FEE_ASSET_AMOUNT]: '100',
            [constants.db.KEY_NETWORK_FEE_ASSET_AMOUNT]: '100',
            [constants.db.KEY_IS_FOR_PROTOCOL]: false,
            [constants.db.KEY_UNDERLYING_ASSET_NAME]: 'pTokens PNT',
            [constants.db.KEY_UNDERLYING_ASSET_SYMBOL]: 'PNT',
            [constants.db.KEY_UNDERLYING_ASSET_DECIMALS]: 18,
            [constants.db.KEY_UNDERLYING_ASSET_NETWORK_ID]: '0xf9b459a1',
            [constants.db.KEY_UNDERLYING_ASSET_TOKEN_ADDRESS]:
              '0xB6bcae6468760bc0CDFb9C8ef4Ee75C9dd23e1Ed',
            [constants.db.KEY_OPTIONS_MASK]:
              '0x0000000000000000000000000000000000000000000000000000000000000000',
            [constants.db.KEY_ORIGINATING_NETWORK_ID]: null,
            [constants.db.KEY_ORIGINATING_ADDRESS]: '0xa41657bf225f8ec7e2010c89c3f084172948264d',
            [constants.db.KEY_ORIGINATING_BLOCK_HASH]: null,
            [constants.db.KEY_ORIGINATING_TX_HASH]: null,
            [constants.db.KEY_NETWORK_ID]: '0xf9b459a1',
            [constants.db.KEY_BLOCK_HASH]:
              '0xf23f2167fa252212acddad3c7e0d292c59dab1e0f7deca2b8f98b1a9383b53e2', // secretlint-disable-line
            [constants.db.KEY_TX_HASH]:
              '0xec42da425ecce69f5417b76822723289fe1f6bca3734fc2cbef1f1a0fd1a6445', // secretlint-disable-line
            [constants.db.KEY_PROPOSAL_TX_HASH]: null,
            [constants.db.KEY_PROPOSAL_TS]: null,
            [constants.db.KEY_PROTOCOL_FEE_ASSET_AMOUNT]: '0',
            [constants.db.KEY_ASSET_TOKEN_ADDRESS]: '0xB6bcae6468760bc0CDFb9C8ef4Ee75C9dd23e1Ed',
            [constants.db.KEY_USER_DATA]: '0x',
            [constants.db.KEY_WITNESSED_TS]: expect.stringMatching(ISO_FORMAT_REGEX),
          })
        } else throw _err
      }
    })
  })
})
