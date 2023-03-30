const EventEmitter = require('events')
const ethers = require('ethers')
const { logs } = require('../mock/evm-logs')
const constants = require('ptokens-constants')
const schemas = require('ptokens-schemas')
const { STATE_KEY_EVENTS } = require('../../lib/state/constants')

const ISO_FORMAT_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/

describe('EVM listener', () => {
  describe('getEthersProvider', () => {
    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('Should get the correct provider', async () => {
      const { getEthersProvider } = require('../../lib/evm/listener-evm')
      const url = 'http://eth-node-1.ext.nu.p.network'

      const getDefaultProviderSpy = jest.spyOn(ethers, 'getDefaultProvider')

      const result = await getEthersProvider(url)

      expect(getDefaultProviderSpy).toHaveBeenCalledTimes(1)
      expect(result).toBeInstanceOf(ethers.providers.JsonRpcProvider)
    })
  })

  describe('listenForEvmEvents', () => {
    afterEach(() => {
      jest.restoreAllMocks()
    })
    it('Should call callback with the standardized event', done => {
      const state = {
        [constants.state.STATE_KEY_CHAIN_ID]: '0x005fe7f9',
        [constants.state.STATE_KEY_PROVIDER_URL]: 'provider-url',
        [STATE_KEY_EVENTS]: [
          {
            [schemas.constants.SCHEMA_NAME_KEY]:
              'Transfer(address indexed from,address indexed to,uint256 value)',
            [schemas.constants.SCHEMA_TOKEN_CONTRACTS_KEY]: [
              '0xdac17f958d2ee523a2206206994597c13d831ec7',
            ],
          },
          {
            [schemas.constants.SCHEMA_NAME_KEY]:
              'UserOperation(uint256 nonce,string destinationAccount,bytes4 destinationNetworkId,string underlyingAssetName,string underlyingAssetSymbol,uint256 underlyingAssetDecimals,address underlyingAssetTokenAddress,bytes4 underlyingAssetNetworkId,address assetTokenAddress,uint256 assetAmount,bytes userData,bytes32 optionsMask)',
            [schemas.constants.SCHEMA_TOKEN_CONTRACTS_KEY]: [
              '0x62199B909FB8B8cf870f97BEf2cE6783493c4908',
            ],
          },
        ],
      }
      const fakeProvider = new EventEmitter()
      fakeProvider._on = fakeProvider.on

      const scheduleEvent = (_address, _log, _ms) =>
        setTimeout(
          _ =>
            fakeProvider.emit(
              JSON.stringify({
                address: _address,
                topics: [_log.topics.at(0)],
              }),
              _log
            ),
          _ms
        )

      scheduleEvent('0xdac17f958d2ee523a2206206994597c13d831ec7', logs[0], 100)
      scheduleEvent('0x45bc7Bc558FcCaA7674310254798A968D9190fd7', logs[0], 300) // malicious attempt
      scheduleEvent('0x62199B909FB8B8cf870f97BEf2cE6783493c4908', logs[1], 400)
      scheduleEvent('0x45bc7Bc558FcCaA7674310254798A968D9190fd7', logs[1], 500) // malicious attempt

      const onListenerSpy = jest
        .spyOn(fakeProvider, 'on')
        .mockImplementation((_filter, _func) =>
          fakeProvider._on(JSON.stringify(_filter), _func)
        )
      const getDefaultProviderSpy = jest
        .spyOn(ethers, 'getDefaultProvider')
        .mockImplementation(_url => fakeProvider)
      const { listenForEvmEvents } = require('../../lib/evm/listener-evm')
      const callback = jest.fn()

      listenForEvmEvents(state, callback)

      setTimeout(() => {
        expect(getDefaultProviderSpy).toHaveBeenNthCalledWith(1, 'provider-url')
        expect(onListenerSpy).toHaveBeenCalledTimes(2)
        expect(onListenerSpy).toHaveBeenNthCalledWith(
          1,
          {
            address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            topics: [
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            ],
          },
          expect.anything()
        )
        expect(onListenerSpy).toHaveBeenNthCalledWith(
          2,
          {
            address: '0x62199B909FB8B8cf870f97BEf2cE6783493c4908',
            topics: [
              '0xba98a314fb19bf102109515e22a4e48acbbe8f5610a657a9ed6cb3327afbc2e2',
            ],
          },
          expect.anything()
        )
        expect(callback).toHaveBeenCalledTimes(2)
        expect(callback).toHaveBeenNthCalledWith(1, {
          _id: '0x37eeb55eab329c73aeac6a172faa6c77e7013cd0cda0fc472274c5faf0df7003',
          [schemas.constants.SCHEMA_STATUS_KEY]:
            schemas.db.enums.txStatus.DETECTED,
          [schemas.constants.SCHEMA_ASSET_AMOUNT_KEY]: '200000000',
          [schemas.constants.SCHEMA_USER_DATA_KEY]: null,
          [schemas.constants.SCHEMA_EVENT_NAME_KEY]: 'Transfer',
          [schemas.constants.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]: null,
          [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: null,
          [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
          [schemas.constants.SCHEMA_WITNESSED_TS_KEY]:
            expect.stringMatching(ISO_FORMAT_REGEX),
          [schemas.constants.SCHEMA_FINAL_TX_HASH_KEY]: null,
          [schemas.constants.SCHEMA_FINAL_TX_TS_KEY]: null,
          [schemas.constants.SCHEMA_OPTIONS_MASK]: null,
          [schemas.constants.SCHEMA_NONCE_KEY]: null,
          [schemas.constants.SCHEMA_DESTINATION_ACCOUNT_KEY]:
            '0x31c43E2be5BCd4EDb512aD47A0F1A93aA22941b9',
          [schemas.constants.SCHEMA_DESTINATION_NETWORK_ID_KEY]: null,
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: null,
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: null,
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]: null,
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]: null,
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]: null,
          [schemas.constants.SCHEMA_ORIGINATING_ADDRESS_KEY]:
            '0xd8a7346Ffef357542857aB5fCF7ed1baED08680f',
          [schemas.constants.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: '0x005fe7f9',
          [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
            '0x37eeb55eab329c73aeac6a172faa6c77e7013cd0cda0fc472274c5faf0df7003',
          [schemas.constants.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]:
            '0x460635ecc1efa7230644fe6c2c01635f873663e81afc8c727947da5560ed12e5',
          [schemas.constants.SCHEMA_ID_KEY]:
            '0xb3a8b1ca0aba479fd02780ffff929d4c700efc9a070327a1440b56a07c502345',
        })
        expect(callback).toHaveBeenNthCalledWith(2, {
          _id: '0x8331da272b47ccc84065aefffe99718f3caaa003d10acd6a42b183deb230e38a',
          [schemas.constants.SCHEMA_STATUS_KEY]:
            schemas.db.enums.txStatus.DETECTED,
          [schemas.constants.SCHEMA_EVENT_NAME_KEY]:
            schemas.db.enums.eventNames.USER_OPERATION,

          [schemas.constants.SCHEMA_NONCE_KEY]: '444444',
          [schemas.constants.SCHEMA_ASSET_AMOUNT_KEY]: '444444444444',
          [schemas.constants.SCHEMA_DESTINATION_ACCOUNT_KEY]:
            '0xc39867e393cb061b837240862d9ad318c176a96d',
          [schemas.constants.SCHEMA_DESTINATION_NETWORK_ID_KEY]: '0x00e4b170',

          [schemas.constants.SCHEMA_FINAL_TX_HASH_KEY]: null,
          [schemas.constants.SCHEMA_FINAL_TX_TS_KEY]: null,
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: 'PNT',
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: 'PNT',
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]: 18,
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]:
            '0x00000001',
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]:
            '0x89Ab32156e46F46D02ade3FEcbe5Fc4243B9AAeD',
          [schemas.constants.SCHEMA_OPTIONS_MASK]:
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          [schemas.constants.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: '0x005fe7f9',
          [schemas.constants.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
          [schemas.constants.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]:
            '0x0fc80f64b06f1de7e0025968e1acea1c8098e99da995654bc8f28b86a5efc8bf',
          [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
            '0x9488dee8cb5c6b2f6299e45e48bba580f46dbd496cfaa70a182060fd5dc81cb5',
          [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
          [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: null,
          [schemas.constants.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]:
            '0x89Ab32156e46F46D02ade3FEcbe5Fc4243B9AAeD',
          [schemas.constants.SCHEMA_USER_DATA_KEY]: '0x',
          [schemas.constants.SCHEMA_WITNESSED_TS_KEY]:
            expect.stringMatching(ISO_FORMAT_REGEX),
        })
        done()
      }, 600)
    })
  })
})
