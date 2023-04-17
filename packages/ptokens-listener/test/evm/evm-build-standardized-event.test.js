const { logs } = require('../mock/evm-logs')
const { getInterfaceFromEvent } = require('../../lib/evm/evm-utils')
const schemas = require('ptokens-schemas')
const { validation } = require('ptokens-utils')

describe('Event building for EVM', () => {
  describe('buildStandardizedEventFromEvmEvent', () => {
    beforeAll(() => {
      jest
        .useFakeTimers({ legacyFakeTimers: false })
        .setSystemTime(new Date('2023-03-14T16:00:00Z'))
    })

    it('Should build a standardized event object for a UserOperation event 1', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const chainId = '0xe15503e4'
      const eventName =
        'UserOperation(uint256 nonce,string destinationAccount,bytes4 destinationNetworkId,string underlyingAssetName,string underlyingAssetSymbol,uint256 underlyingAssetDecimals,address underlyingAssetTokenAddress,bytes4 underlyingAssetNetworkId,address assetTokenAddress,uint256 assetAmount,bytes userData,bytes32 optionsMask)'
      const eventLog = logs[1]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        chainId,
        methodInterface,
        eventLog
      )

      const expected = {
        [schemas.constants.SCHEMA_ID_KEY]:
          '0xbe8b7571ab50cc63da7f1d9f6b22802922aa2e242a5c7400c493ba9c831b24aa',
        [schemas.constants.SCHEMA_STATUS_KEY]:
          schemas.db.enums.txStatus.DETECTED,
        [schemas.constants.SCHEMA_EVENT_NAME_KEY]:
          schemas.db.enums.eventNames.USER_OPERATION,

        [schemas.constants.SCHEMA_NONCE_KEY]: '6648',
        [schemas.constants.SCHEMA_ASSET_AMOUNT_KEY]: '1000000000000000000',
        [schemas.constants.SCHEMA_DESTINATION_ACCOUNT_KEY]:
          '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        [schemas.constants.SCHEMA_DESTINATION_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.SCHEMA_FINAL_TX_HASH_KEY]: null,
        [schemas.constants.SCHEMA_FINAL_TX_TS_KEY]: null,
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: 'Token',
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: 'TKN',
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]: 18,
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]:
          '0xe15503e4',
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.SCHEMA_OPTIONS_MASK]:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        [schemas.constants.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
        [schemas.constants.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]:
          '0xbaa9e89896c03366c3578a4568a6defd4b127e4b09bb06b67a12cb1a4c332376',
        [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
          '0x0907eefad58dfcb2cbfad66d29accd4d6ddc345851ec1d180b23122084fa2834',
        [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
        [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: null,
        [schemas.constants.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.SCHEMA_USER_DATA_KEY]: '0x',
        [schemas.constants.SCHEMA_WITNESSED_TS_KEY]: '2023-03-14T16:00:00.000Z',
      }
      await validation.validateJson(schemas.db.collections.events, expected)
      expect(result).toStrictEqual(expected)
    })

    it('Should build a standardized event object for a UserOperation event 2', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const chainId = '0xe15503e4'
      const eventName =
        'UserOperation(uint256 nonce,string destinationAccount,bytes4 destinationNetworkId,string underlyingAssetName,string underlyingAssetSymbol,uint256 underlyingAssetDecimals,address underlyingAssetTokenAddress,bytes4 underlyingAssetNetworkId,address assetTokenAddress,uint256 assetAmount,bytes userData,bytes32 optionsMask)'
      const eventLog = logs[2]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        chainId,
        methodInterface,
        eventLog
      )

      const expected = {
        [schemas.constants.SCHEMA_ID_KEY]:
          '0x62be3b1256761376f7ad4bbedd59b853a734e01b77520e6bc7d27efc10758864',
        [schemas.constants.SCHEMA_STATUS_KEY]:
          schemas.db.enums.txStatus.DETECTED,
        [schemas.constants.SCHEMA_EVENT_NAME_KEY]:
          schemas.db.enums.eventNames.USER_OPERATION,

        [schemas.constants.SCHEMA_NONCE_KEY]: '6648',
        [schemas.constants.SCHEMA_ASSET_AMOUNT_KEY]: '2000000000000000000',
        [schemas.constants.SCHEMA_DESTINATION_ACCOUNT_KEY]:
          '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        [schemas.constants.SCHEMA_DESTINATION_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.SCHEMA_FINAL_TX_HASH_KEY]: null,
        [schemas.constants.SCHEMA_FINAL_TX_TS_KEY]: null,
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: 'Token',
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: 'TKN',
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]: 18,
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]:
          '0xe15503e4',
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.SCHEMA_OPTIONS_MASK]:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        [schemas.constants.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
        [schemas.constants.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]:
          '0xbfed1379abf5ebce29b4f74a4159a0795f42f97b260199d05acdcb567d0b0b85',
        [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
          '0xed4fc787108745e0414cdcd24fe82afd82bbbb60d4976feefb6687253d558be8',
        [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
        [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: null,
        [schemas.constants.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.SCHEMA_USER_DATA_KEY]: '0x',
        [schemas.constants.SCHEMA_WITNESSED_TS_KEY]: '2023-03-14T16:00:00.000Z',
      }
      await validation.validateJson(schemas.db.collections.events, expected)
      expect(result).toStrictEqual(expected)
    })

    it('Should build a standardized event object for a UserOperation event 3', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const chainId = '0xe15503e4'
      const eventName =
        'UserOperation(uint256 nonce,string destinationAccount,bytes4 destinationNetworkId,string underlyingAssetName,string underlyingAssetSymbol,uint256 underlyingAssetDecimals,address underlyingAssetTokenAddress,bytes4 underlyingAssetNetworkId,address assetTokenAddress,uint256 assetAmount,bytes userData,bytes32 optionsMask)'
      const eventLog = logs[3]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        chainId,
        methodInterface,
        eventLog
      )

      const expected = {
        [schemas.constants.SCHEMA_ID_KEY]:
          '0xb3b4f34d53bcc3cb942d2582b740189e4027dbb7bd5c92757f8452f448c2bbb9',
        [schemas.constants.SCHEMA_STATUS_KEY]:
          schemas.db.enums.txStatus.DETECTED,
        [schemas.constants.SCHEMA_EVENT_NAME_KEY]:
          schemas.db.enums.eventNames.USER_OPERATION,

        [schemas.constants.SCHEMA_NONCE_KEY]: '6648',
        [schemas.constants.SCHEMA_ASSET_AMOUNT_KEY]: '3000000000000000000',
        [schemas.constants.SCHEMA_DESTINATION_ACCOUNT_KEY]:
          '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        [schemas.constants.SCHEMA_DESTINATION_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.SCHEMA_FINAL_TX_HASH_KEY]: null,
        [schemas.constants.SCHEMA_FINAL_TX_TS_KEY]: null,
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: 'Token',
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: 'TKN',
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]: 18,
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]:
          '0xe15503e4',
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.SCHEMA_OPTIONS_MASK]:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        [schemas.constants.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
        [schemas.constants.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]:
          '0x51a7df3cedcc76917b037b74bdd82a315f812a0cdbcac7ad70a8bce9d4150af4',
        [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
          '0xfad8f21a2981f49eafe79334d5b4b81fa95db5a1e40f0f633a22ad7e55b793a4',
        [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
        [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: null,
        [schemas.constants.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.SCHEMA_USER_DATA_KEY]: '0x',
        [schemas.constants.SCHEMA_WITNESSED_TS_KEY]: '2023-03-14T16:00:00.000Z',
      }
      await validation.validateJson(schemas.db.collections.events, expected)
      expect(result).toStrictEqual(expected)
    })

    it('Should build a standardized event object for a UserOperation event 4', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const chainId = '0xe15503e4'
      const eventName =
        'UserOperation(uint256 nonce,string destinationAccount,bytes4 destinationNetworkId,string underlyingAssetName,string underlyingAssetSymbol,uint256 underlyingAssetDecimals,address underlyingAssetTokenAddress,bytes4 underlyingAssetNetworkId,address assetTokenAddress,uint256 assetAmount,bytes userData,bytes32 optionsMask)'
      const eventLog = logs[4]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        chainId,
        methodInterface,
        eventLog
      )

      const expected = {
        [schemas.constants.SCHEMA_ID_KEY]:
          '0x7794b69ee042872159e5c4810addb698e4032ed6f4a3e1bdb94e38021d2f5146',
        [schemas.constants.SCHEMA_STATUS_KEY]:
          schemas.db.enums.txStatus.DETECTED,
        [schemas.constants.SCHEMA_EVENT_NAME_KEY]:
          schemas.db.enums.eventNames.USER_OPERATION,

        [schemas.constants.SCHEMA_NONCE_KEY]: '6648',
        [schemas.constants.SCHEMA_ASSET_AMOUNT_KEY]: '4000000000000000000',
        [schemas.constants.SCHEMA_DESTINATION_ACCOUNT_KEY]:
          '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        [schemas.constants.SCHEMA_DESTINATION_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.SCHEMA_FINAL_TX_HASH_KEY]: null,
        [schemas.constants.SCHEMA_FINAL_TX_TS_KEY]: null,
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: 'Token',
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: 'TKN',
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]: 18,
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]:
          '0xe15503e4',
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.SCHEMA_OPTIONS_MASK]:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        [schemas.constants.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
        [schemas.constants.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]:
          '0x1ed0f553eded679ce381d6d6d542971fec13b461035d0ebbfb8175910c5cd775',
        [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
          '0x037a7080ea701a0bf91b4f8a5f5671c3565da3dbcda916938eb597f9b4dcab2c',
        [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
        [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: null,
        [schemas.constants.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.SCHEMA_USER_DATA_KEY]: '0x',
        [schemas.constants.SCHEMA_WITNESSED_TS_KEY]: '2023-03-14T16:00:00.000Z',
      }
      await validation.validateJson(schemas.db.collections.events, expected)
      expect(result).toStrictEqual(expected)
    })

    it('Should build a standardized event object for a UserOperation event 5', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const chainId = '0xe15503e4'
      const eventName =
        'UserOperation(uint256 nonce,string destinationAccount,bytes4 destinationNetworkId,string underlyingAssetName,string underlyingAssetSymbol,uint256 underlyingAssetDecimals,address underlyingAssetTokenAddress,bytes4 underlyingAssetNetworkId,address assetTokenAddress,uint256 assetAmount,bytes userData,bytes32 optionsMask)'
      const eventLog = logs[5]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        chainId,
        methodInterface,
        eventLog
      )

      const expected = {
        [schemas.constants.SCHEMA_ID_KEY]:
          '0xcf021d05f8a70b96146067ba8f21cf26d00ad28fd7dc72fda247b4b87144459a',
        [schemas.constants.SCHEMA_STATUS_KEY]:
          schemas.db.enums.txStatus.DETECTED,
        [schemas.constants.SCHEMA_EVENT_NAME_KEY]:
          schemas.db.enums.eventNames.USER_OPERATION,

        [schemas.constants.SCHEMA_NONCE_KEY]: '6648',
        [schemas.constants.SCHEMA_ASSET_AMOUNT_KEY]: '5000000000000000000',
        [schemas.constants.SCHEMA_DESTINATION_ACCOUNT_KEY]:
          '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        [schemas.constants.SCHEMA_DESTINATION_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.SCHEMA_FINAL_TX_HASH_KEY]: null,
        [schemas.constants.SCHEMA_FINAL_TX_TS_KEY]: null,
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: 'Token',
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: 'TKN',
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]: 18,
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]:
          '0xe15503e4',
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.SCHEMA_OPTIONS_MASK]:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        [schemas.constants.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
        [schemas.constants.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]:
          '0x857652df471ab5d968caaa6638c7c60dd3bc71cf02ce3275e79ecf9719be57bf',
        [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
          '0x49ad2874e8e46263ce0dc8afdeae47c51409b183501d5a304aa2f9e2d538ec8a',
        [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
        [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: null,
        [schemas.constants.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.SCHEMA_USER_DATA_KEY]: '0x',
        [schemas.constants.SCHEMA_WITNESSED_TS_KEY]: '2023-03-14T16:00:00.000Z',
      }
      await validation.validateJson(schemas.db.collections.events, expected)
      expect(result).toStrictEqual(expected)
    })

    it('Should build a standardized event object for a UserOperation event 6', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const chainId = '0xe15503e4'
      const eventName =
        'UserOperation(uint256 nonce,string destinationAccount,bytes4 destinationNetworkId,string underlyingAssetName,string underlyingAssetSymbol,uint256 underlyingAssetDecimals,address underlyingAssetTokenAddress,bytes4 underlyingAssetNetworkId,address assetTokenAddress,uint256 assetAmount,bytes userData,bytes32 optionsMask)'
      const eventLog = logs[6]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        chainId,
        methodInterface,
        eventLog
      )

      const expected = {
        [schemas.constants.SCHEMA_ID_KEY]:
          '0x2ca0c7c469fbee9866b12c9c28b682d832782a3ee515832ad1e195953bc94d26',
        [schemas.constants.SCHEMA_STATUS_KEY]:
          schemas.db.enums.txStatus.DETECTED,
        [schemas.constants.SCHEMA_EVENT_NAME_KEY]:
          schemas.db.enums.eventNames.USER_OPERATION,

        [schemas.constants.SCHEMA_NONCE_KEY]: '6649',
        [schemas.constants.SCHEMA_ASSET_AMOUNT_KEY]: '6000000000000000000',
        [schemas.constants.SCHEMA_DESTINATION_ACCOUNT_KEY]:
          '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        [schemas.constants.SCHEMA_DESTINATION_NETWORK_ID_KEY]: '0xf9b459a1',
        [schemas.constants.SCHEMA_FINAL_TX_HASH_KEY]: null,
        [schemas.constants.SCHEMA_FINAL_TX_TS_KEY]: null,
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: 'Token',
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: 'TKN',
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]: 18,
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]:
          '0xe15503e4',
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.SCHEMA_OPTIONS_MASK]:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        [schemas.constants.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
        [schemas.constants.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]:
          '0x2eeefc9258765455e8e347c7e6b2e3b167afbf2354e6cafd30049c6fc5f4d010',
        [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
          '0x2b948164aad1517cdcd11e22c3f96d58b146fdee233ab74e46cb038afcc273e3',
        [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
        [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: null,
        [schemas.constants.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.SCHEMA_USER_DATA_KEY]: '0x',
        [schemas.constants.SCHEMA_WITNESSED_TS_KEY]: '2023-03-14T16:00:00.000Z',
      }
      await validation.validateJson(schemas.db.collections.events, expected)
      expect(result).toStrictEqual(expected)
    })
  })
})
