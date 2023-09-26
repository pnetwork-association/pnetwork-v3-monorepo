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
        .spyOn(ethers, 'getDefaultProvider')
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
              topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
            },
            expect.anything()
          )
          expect(onListenerSpy).toHaveBeenNthCalledWith(
            2,
            {
              address: '0xd2bac275fffdbdd23ecea72f4b161b3af90300a3',
              topics: ['0xf4faec7e493ced73194f78a54c931da9a2d6c6b9552b223cc9ad2965322789b7'],
            },
            expect.anything()
          )
          expect(callback).toHaveBeenCalledTimes(2)
          expect(callback).toHaveBeenNthCalledWith(1, {
            [constants.db.KEY_ID]:
              'transfer_0xc43c1614b094019835a81f1f889a679e109dd5efe2542c1050888f77985feeb1',
            [constants.db.KEY_STATUS]: constants.db.txStatus.DETECTED,
            [constants.db.KEY_ASSET_AMOUNT]: '200000000',
            [constants.db.KEY_USER_DATA]: null,
            [constants.db.KEY_EVENT_NAME]: 'Transfer',
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
              '0x460635ecc1efa7230644fe6c2c01635f873663e81afc8c727947da5560ed12e5',
            [constants.db.KEY_TX_HASH]:
              '0x37eeb55eab329c73aeac6a172faa6c77e7013cd0cda0fc472274c5faf0df7003',
          })
          expect(callback).toHaveBeenNthCalledWith(2, {
            [constants.db.KEY_ID]:
              'useroperation_0x1b5cce11167a6e2801ca4031aab7d815217747730f0790f83e0c43d9766cf48e',
            [constants.db.KEY_STATUS]: constants.db.txStatus.DETECTED,
            [constants.db.KEY_EVENT_NAME]: constants.db.eventNames.USER_OPERATION,

            [constants.db.KEY_NONCE]: '629648',
            [constants.db.KEY_ASSET_AMOUNT]: '198600',
            [constants.db.KEY_DESTINATION_ACCOUNT]: '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
            [constants.db.KEY_DESTINATION_NETWORK_ID]: '0xb9286154',

            [constants.db.KEY_FINAL_TX_HASH]: null,
            [constants.db.KEY_FINAL_TX_TS]: null,
            [constants.db.KEY_FORWARD_DESTINATION_NETWORK_ID]: '0x00000000',
            [constants.db.KEY_FORWARD_NETWORK_FEE_ASSET_AMOUNT]: '0',
            [constants.db.KEY_NETWORK_FEE_ASSET_AMOUNT]: '2000',
            [constants.db.KEY_IS_FOR_PROTOCOL]: false,
            [constants.db.KEY_UNDERLYING_ASSET_NAME]: 'pNetwork Token',
            [constants.db.KEY_UNDERLYING_ASSET_SYMBOL]: 'PNT',
            [constants.db.KEY_UNDERLYING_ASSET_DECIMALS]: 18,
            [constants.db.KEY_UNDERLYING_ASSET_NETWORK_ID]: '0x5aca268b',
            [constants.db.KEY_UNDERLYING_ASSET_TOKEN_ADDRESS]:
              '0xdaacB0Ab6Fb34d24E8a67BfA14BF4D95D4C7aF92',
            [constants.db.KEY_OPTIONS_MASK]:
              '0x0000000000000000000000000000000000000000000000000000000000000000',
            [constants.db.KEY_ORIGINATING_NETWORK_ID]: null,
            [constants.db.KEY_ORIGINATING_ADDRESS]: '0xddb5f4535123daa5ae343c24006f4075abaf5f7b',
            [constants.db.KEY_ORIGINATING_BLOCK_HASH]: null,
            [constants.db.KEY_ORIGINATING_TX_HASH]: null,
            [constants.db.KEY_NETWORK_ID]: '0xf9b459a1',
            [constants.db.KEY_BLOCK_HASH]:
              '0x0fc3588f727dde10ccd937b04f5666fb04e39553b4c73719555acd7a6a430764',
            [constants.db.KEY_TX_HASH]:
              '0xa5c5838123aa37d2efd69285f7b6bd8c2e93d4cf243d45926169502c13b23a49',
            [constants.db.KEY_PROPOSAL_TX_HASH]: null,
            [constants.db.KEY_PROPOSAL_TS]: null,
            [constants.db.KEY_PROTOCOL_FEE_ASSET_AMOUNT]: '0',
            [constants.db.KEY_ASSET_TOKEN_ADDRESS]: '0xa7dbA6b864476FcE03659622d4E22253FE048096',
            [constants.db.KEY_USER_DATA]: '0x',
            [constants.db.KEY_WITNESSED_TS]: expect.stringMatching(ISO_FORMAT_REGEX),
          })
        } else throw _err
      }
    })
  })
})
