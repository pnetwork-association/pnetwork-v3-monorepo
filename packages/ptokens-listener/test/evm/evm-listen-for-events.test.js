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
        [constants.state.KEY_NETWORK_ID]: '0xe15503e4',
        [constants.state.KEY_PROVIDER_URL]: 'provider-url',
        [STATE_KEY_EVENTS]: [
          {
            [constants.config.KEY_NAME]:
              'Transfer(address indexed from,address indexed to,uint256 value)',
            [constants.config.KEY_CONTRACTS]: ['0xdac17f958d2ee523a2206206994597c13d831ec7'],
          },
          {
            [constants.config.KEY_NAME]:
              'UserOperation(uint256 nonce,string destinationAccount,bytes4 destinationNetworkId,string underlyingAssetName,string underlyingAssetSymbol,uint256 underlyingAssetDecimals,address underlyingAssetTokenAddress,bytes4 underlyingAssetNetworkId,address assetTokenAddress,uint256 assetAmount,bytes userData,bytes32 optionsMask)',
            [constants.config.KEY_CONTRACTS]: ['0xEFcD9f9eE77A79A6E2536cb3759Ed3c00107a398'],
          },
        ],
      }
      const fakeProvider = new EventEmitter()
      fakeProvider._on = fakeProvider.on

      const onListenerSpy = jest
        .spyOn(fakeProvider, 'on')
        .mockImplementationOnce((_filter, _func) => _func(logs[0]))
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
              address: '0xEFcD9f9eE77A79A6E2536cb3759Ed3c00107a398',
              topics: ['0xba98a314fb19bf102109515e22a4e48acbbe8f5610a657a9ed6cb3327afbc2e2'],
            },
            expect.anything()
          )
          expect(callback).toHaveBeenCalledTimes(2)
          expect(callback).toHaveBeenNthCalledWith(1, {
            [constants.db.KEY_ID]:
              'transfer_0x36f48a80848eeb2b49d59aac077aedf775f75463ed7d34b531750329dceaa8b5',
            [constants.db.KEY_STATUS]: constants.db.txStatus.DETECTED,
            [constants.db.KEY_ASSET_AMOUNT]: '200000000',
            [constants.db.KEY_USER_DATA]: null,
            [constants.db.KEY_EVENT_NAME]: 'Transfer',
            [constants.db.KEY_ASSET_TOKEN_ADDRESS]: null,
            [constants.db.KEY_PROPOSAL_TS]: null,
            [constants.db.KEY_PROPOSAL_TX_HASH]: null,
            [constants.db.KEY_WITNESSED_TS]: expect.stringMatching(ISO_FORMAT_REGEX),
            [constants.db.KEY_FINAL_TX_HASH]: null,
            [constants.db.KEY_FINAL_TX_TS]: null,
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
            [constants.db.KEY_NETWORK_ID]: '0xe15503e4',
            [constants.db.KEY_BLOCK_HASH]:
              '0x460635ecc1efa7230644fe6c2c01635f873663e81afc8c727947da5560ed12e5',
            [constants.db.KEY_TX_HASH]:
              '0x37eeb55eab329c73aeac6a172faa6c77e7013cd0cda0fc472274c5faf0df7003',
          })
          expect(callback).toHaveBeenNthCalledWith(2, {
            [constants.db.KEY_ID]:
              'useroperation_0xbe8b7571ab50cc63da7f1d9f6b22802922aa2e242a5c7400c493ba9c831b24aa',
            [constants.db.KEY_STATUS]: constants.db.txStatus.DETECTED,
            [constants.db.KEY_EVENT_NAME]: constants.db.eventNames.USER_OPERATION,

            [constants.db.KEY_NONCE]: '6648',
            [constants.db.KEY_ASSET_AMOUNT]: '1000000000000000000',
            [constants.db.KEY_DESTINATION_ACCOUNT]: '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
            [constants.db.KEY_DESTINATION_NETWORK_ID]: '0xe15503e4',

            [constants.db.KEY_FINAL_TX_HASH]: null,
            [constants.db.KEY_FINAL_TX_TS]: null,
            [constants.db.KEY_UNDERLYING_ASSET_NAME]: 'Token',
            [constants.db.KEY_UNDERLYING_ASSET_SYMBOL]: 'TKN',
            [constants.db.KEY_UNDERLYING_ASSET_DECIMALS]: 18,
            [constants.db.KEY_UNDERLYING_ASSET_NETWORK_ID]: '0xe15503e4',
            [constants.db.KEY_UNDERLYING_ASSET_TOKEN_ADDRESS]:
              '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
            [constants.db.KEY_OPTIONS_MASK]:
              '0x0000000000000000000000000000000000000000000000000000000000000000',
            [constants.db.KEY_ORIGINATING_NETWORK_ID]: null,
            [constants.db.KEY_ORIGINATING_ADDRESS]: null,
            [constants.db.KEY_ORIGINATING_BLOCK_HASH]: null,
            [constants.db.KEY_ORIGINATING_TX_HASH]: null,
            [constants.db.KEY_NETWORK_ID]: '0xe15503e4',
            [constants.db.KEY_BLOCK_HASH]:
              '0xbaa9e89896c03366c3578a4568a6defd4b127e4b09bb06b67a12cb1a4c332376',
            [constants.db.KEY_TX_HASH]:
              '0x0907eefad58dfcb2cbfad66d29accd4d6ddc345851ec1d180b23122084fa2834',
            [constants.db.KEY_PROPOSAL_TX_HASH]: null,
            [constants.db.KEY_PROPOSAL_TS]: null,
            [constants.db.KEY_ASSET_TOKEN_ADDRESS]: '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
            [constants.db.KEY_USER_DATA]: '0x',
            [constants.db.KEY_WITNESSED_TS]: expect.stringMatching(ISO_FORMAT_REGEX),
          })
        } else throw _err
      }
    })
  })
})
