const EventEmitter = require('events')
const ethers = require('ethers')
const { logs } = require('../mock/evm-logs')
const { identity } = require('ramda')
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

  describe('processEventLog', () => {
    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('Should process the event as expected', async () => {
      const {
        processEventLog,
        getInterfaceFromEvent,
      } = require('../../lib/evm/listener-evm')
      const chainId = '0x1234'
      const eventName =
        'Redeem(address indexed redeemer, uint256 value, string underlyingAssetRecipient, bytes userData, bytes4 originChainId, bytes4 destinationChainId)'
      const methodInterface = await getInterfaceFromEvent(eventName)
      const callback = identity

      const result = await processEventLog(
        chainId,
        methodInterface,
        callback,
        logs[2]
      )

      const expected = {
        [schemas.constants.SCHEMA_STATUS_KEY]:
          schemas.db.enums.txStatus.DETECTED,
        [schemas.constants.SCHEMA_AMOUNT_KEY]: '2065832100000000000',
        [schemas.constants.SCHEMA_USER_DATA_KEY]: null,
        [schemas.constants.SCHEMA_EVENT_NAME_KEY]: 'redeem',
        [schemas.constants.SCHEMA_TOKEN_ADDRESS_KEY]: null,
        [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: null,
        [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
        [schemas.constants.SCHEMA_WITNESSED_TS_KEY]:
          expect.stringMatching(ISO_FORMAT_REGEX),
        [schemas.constants.SCHEMA_FINAL_TX_HASH_KEY]: null,
        [schemas.constants.SCHEMA_FINAL_TX_TS_KEY]: null,
        [schemas.constants.SCHEMA_DESTINATION_ADDRESS_KEY]:
          '35eXzETyUxiQPXwU2udtVFQFrFjgRhhvPj',
        [schemas.constants.SCHEMA_DESTINATION_CHAIN_ID_KEY]: '0x01ec97de',
        [schemas.constants.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
        [schemas.constants.SCHEMA_ORIGINATING_CHAIN_ID_KEY]: '0x005fe7f9',
        [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
          '0x9488dee8cb5c6b2f6299e45e48bba580f46dbd496cfaa70a182060fd5dc81cb4',
        _id: '0x005fe7f9_0x9488dee8cb5c6b2f6299e45e48bba580f46dbd496cfaa70a182060fd5dc81cb4',
      }

      expect(result).toStrictEqual(expected)
    })
  })

  describe('listenFromFilter', () => {
    afterEach(() => {
      jest.restoreAllMocks()
    })
    it('Should filter for the correct event and call the callback', async () => {
      const fakeProvider = new EventEmitter()
      fakeProvider._on = fakeProvider.on

      jest
        .spyOn(ethers, 'getDefaultProvider')
        .mockImplementation(_url => fakeProvider)

      const {
        listenFromFilter,
        getInterfaceFromEvent,
      } = require('../../lib/evm/listener-evm')

      const callback = jest.fn()
      const url = 'http://url.io'
      const chainId = '0x1234'
      const eventName =
        'Redeem(address indexed redeemer, uint256 value, string underlyingAssetRecipient, bytes userData, bytes4 originChainId, bytes4 destinationChainId)'
      const methodInterface = await getInterfaceFromEvent(eventName)

      listenFromFilter(url, chainId, eventName, methodInterface, callback)

      const expected = {
        [schemas.constants.SCHEMA_STATUS_KEY]:
          schemas.db.enums.txStatus.DETECTED,
        [schemas.constants.SCHEMA_AMOUNT_KEY]: '2065832100000000000',
        [schemas.constants.SCHEMA_USER_DATA_KEY]: null,
        [schemas.constants.SCHEMA_EVENT_NAME_KEY]: 'redeem',
        [schemas.constants.SCHEMA_TOKEN_ADDRESS_KEY]: null,
        [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: null,
        [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
        [schemas.constants.SCHEMA_WITNESSED_TS_KEY]:
          expect.stringMatching(ISO_FORMAT_REGEX),
        [schemas.constants.SCHEMA_FINAL_TX_HASH_KEY]: null,
        [schemas.constants.SCHEMA_FINAL_TX_TS_KEY]: null,
        [schemas.constants.SCHEMA_DESTINATION_ADDRESS_KEY]:
          '35eXzETyUxiQPXwU2udtVFQFrFjgRhhvPj',
        [schemas.constants.SCHEMA_DESTINATION_CHAIN_ID_KEY]: '0x01ec97de',
        [schemas.constants.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
        [schemas.constants.SCHEMA_ORIGINATING_CHAIN_ID_KEY]: '0x005fe7f9',
        [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
          '0x9488dee8cb5c6b2f6299e45e48bba580f46dbd496cfaa70a182060fd5dc81cb4',
        _id: '0x005fe7f9_0x9488dee8cb5c6b2f6299e45e48bba580f46dbd496cfaa70a182060fd5dc81cb4',
      }
      const assertions = () => {
        expect(callback).toHaveBeenNthCalledWith(1, expected)
      }

      setTimeout(() => fakeProvider.emit(eventName, logs[2]), 100)
      setTimeout(assertions, 400)
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
              'PegIn(address _tokenAddress, address _tokenSender, uint256 _tokenAmount, string _destinationAddress, bytes _userData, bytes4 _originChainId, bytes4 _destinationChainId)',
            [schemas.constants.SCHEMA_TOKEN_CONTRACTS_KEY]: [
              '0xe396757ec7e6ac7c8e5abe7285dde47b98f22db8',
            ],
          },
          {
            [schemas.constants.SCHEMA_NAME_KEY]:
              'Redeem(address indexed redeemer, uint256 value, string underlyingAssetRecipient, bytes userData, bytes4 originChainId, bytes4 destinationChainId)',
            [schemas.constants.SCHEMA_TOKEN_CONTRACTS_KEY]: [
              '0x62199b909fb8b8cf870f97bef2ce6783493c4908',
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
      scheduleEvent('0xe396757ec7e6ac7c8e5abe7285dde47b98f22db8', logs[1], 200)
      scheduleEvent('0x45bc7Bc558FcCaA7674310254798A968D9190fd7', logs[1], 300) // malicious attempt
      scheduleEvent('0x62199b909fb8b8cf870f97bef2ce6783493c4908', logs[2], 400)
      scheduleEvent('0x45bc7Bc558FcCaA7674310254798A968D9190fd7', logs[2], 500) // malicious attempt

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
            address: '0xe396757ec7e6ac7c8e5abe7285dde47b98f22db8',
            topics: [
              '0xc03be660a5421fb17c93895da9db564bd4485d475f0d8b3175f7d55ed421bebb',
            ],
          },
          expect.anything()
        )
        expect(onListenerSpy).toHaveBeenNthCalledWith(
          3,
          {
            address: '0x62199b909fb8b8cf870f97bef2ce6783493c4908',
            topics: [
              '0xdd56da0e6e7b301867b3632876d707f60c7cbf4b06f9ae191c67ea016cc5bf31',
            ],
          },
          expect.anything()
        )
        expect(callback).toHaveBeenCalledTimes(3)
        expect(callback).toHaveBeenNthCalledWith(1, {
          [schemas.constants.SCHEMA_STATUS_KEY]:
            schemas.db.enums.txStatus.DETECTED,
          [schemas.constants.SCHEMA_AMOUNT_KEY]: '200000000',
          [schemas.constants.SCHEMA_USER_DATA_KEY]: null,
          [schemas.constants.SCHEMA_EVENT_NAME_KEY]: 'transfer',
          [schemas.constants.SCHEMA_TOKEN_ADDRESS_KEY]: null,
          [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: null,
          [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
          [schemas.constants.SCHEMA_WITNESSED_TS_KEY]:
            expect.stringMatching(ISO_FORMAT_REGEX),
          [schemas.constants.SCHEMA_FINAL_TX_HASH_KEY]: null,
          [schemas.constants.SCHEMA_FINAL_TX_TS_KEY]: null,
          [schemas.constants.SCHEMA_DESTINATION_ADDRESS_KEY]: null,
          [schemas.constants.SCHEMA_DESTINATION_CHAIN_ID_KEY]: null,
          [schemas.constants.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
          [schemas.constants.SCHEMA_ORIGINATING_CHAIN_ID_KEY]: '0x005fe7f9',
          [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
            '0x37eeb55eab329c73aeac6a172faa6c77e7013cd0cda0fc472274c5faf0df7003',
          _id: '0x005fe7f9_0x37eeb55eab329c73aeac6a172faa6c77e7013cd0cda0fc472274c5faf0df7003',
        })
        expect(callback).toHaveBeenNthCalledWith(2, {
          [schemas.constants.SCHEMA_STATUS_KEY]:
            schemas.db.enums.txStatus.DETECTED,
          [schemas.constants.SCHEMA_AMOUNT_KEY]: '1001000000',
          [schemas.constants.SCHEMA_USER_DATA_KEY]: null,
          [schemas.constants.SCHEMA_EVENT_NAME_KEY]: 'pegin',
          [schemas.constants.SCHEMA_TOKEN_ADDRESS_KEY]:
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: null,
          [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
          [schemas.constants.SCHEMA_WITNESSED_TS_KEY]:
            expect.stringMatching(ISO_FORMAT_REGEX),
          [schemas.constants.SCHEMA_FINAL_TX_HASH_KEY]: null,
          [schemas.constants.SCHEMA_FINAL_TX_TS_KEY]: null,
          [schemas.constants.SCHEMA_DESTINATION_ADDRESS_KEY]: '770102986',
          [schemas.constants.SCHEMA_DESTINATION_CHAIN_ID_KEY]: '0x03c38e67',
          [schemas.constants.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
          [schemas.constants.SCHEMA_ORIGINATING_CHAIN_ID_KEY]: '0x005fe7f9',
          [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
            '0x0f53438f23bd61bcee616d4f4d0f70a80dcd1d10dc8b0796774cb4afa6340305',
          _id: '0x005fe7f9_0x0f53438f23bd61bcee616d4f4d0f70a80dcd1d10dc8b0796774cb4afa6340305',
        })
        expect(callback).toHaveBeenNthCalledWith(3, {
          [schemas.constants.SCHEMA_STATUS_KEY]:
            schemas.db.enums.txStatus.DETECTED,
          [schemas.constants.SCHEMA_AMOUNT_KEY]: '2065832100000000000',
          [schemas.constants.SCHEMA_USER_DATA_KEY]: null,
          [schemas.constants.SCHEMA_EVENT_NAME_KEY]: 'redeem',
          [schemas.constants.SCHEMA_TOKEN_ADDRESS_KEY]: null,
          [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: null,
          [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
          [schemas.constants.SCHEMA_WITNESSED_TS_KEY]:
            expect.stringMatching(ISO_FORMAT_REGEX),
          [schemas.constants.SCHEMA_FINAL_TX_HASH_KEY]: null,
          [schemas.constants.SCHEMA_FINAL_TX_TS_KEY]: null,
          [schemas.constants.SCHEMA_DESTINATION_ADDRESS_KEY]:
            '35eXzETyUxiQPXwU2udtVFQFrFjgRhhvPj',
          [schemas.constants.SCHEMA_DESTINATION_CHAIN_ID_KEY]: '0x01ec97de',
          [schemas.constants.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
          [schemas.constants.SCHEMA_ORIGINATING_CHAIN_ID_KEY]: '0x005fe7f9',
          [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
            '0x9488dee8cb5c6b2f6299e45e48bba580f46dbd496cfaa70a182060fd5dc81cb4',
          _id: '0x005fe7f9_0x9488dee8cb5c6b2f6299e45e48bba580f46dbd496cfaa70a182060fd5dc81cb4',
        })
        done()
      }, 600)
    })
  })
})
