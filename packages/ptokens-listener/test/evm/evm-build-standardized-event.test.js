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

    afterAll(() => {
      jest.useRealTimers()
    })

    it('Should build a standardized event object for a UserOperation event 1', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const networkId = '0xe15503e4'
      const eventName =
        'UserOperation(uint256 nonce,string destinationAccount,bytes4 destinationNetworkId,string underlyingAssetName,string underlyingAssetSymbol,uint256 underlyingAssetDecimals,address underlyingAssetTokenAddress,bytes4 underlyingAssetNetworkId,address assetTokenAddress,uint256 assetAmount,bytes userData,bytes32 optionsMask)'
      const eventLog = logs[1]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        networkId,
        methodInterface,
        eventLog
      )

      const expected = {
        [schemas.constants.reportFields.SCHEMA_ID_KEY]:
          'useroperation_0xbe8b7571ab50cc63da7f1d9f6b22802922aa2e242a5c7400c493ba9c831b24aa',
        [schemas.constants.reportFields.SCHEMA_STATUS_KEY]: constants.db.txStatus.DETECTED,
        [schemas.constants.reportFields.SCHEMA_EVENT_NAME_KEY]:
          constants.db.eventNames.USER_OPERATION,

        [schemas.constants.reportFields.SCHEMA_NONCE_KEY]: '6648',
        [schemas.constants.reportFields.SCHEMA_ASSET_AMOUNT_KEY]: '1000000000000000000',
        [schemas.constants.reportFields.SCHEMA_DESTINATION_ACCOUNT_KEY]:
          '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        [schemas.constants.reportFields.SCHEMA_DESTINATION_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_FINAL_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_FINAL_TX_TS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: 'Token',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: 'TKN',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]: 18,
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.reportFields.SCHEMA_OPTIONS_MASK]:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_BLOCK_HASH_KEY]:
          '0xbaa9e89896c03366c3578a4568a6defd4b127e4b09bb06b67a12cb1a4c332376',
        [schemas.constants.reportFields.SCHEMA_TX_HASH_KEY]:
          '0x0907eefad58dfcb2cbfad66d29accd4d6ddc345851ec1d180b23122084fa2834',
        [schemas.constants.reportFields.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_PROPOSAL_TS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.reportFields.SCHEMA_USER_DATA_KEY]: '0x',
        [schemas.constants.reportFields.SCHEMA_WITNESSED_TS_KEY]: '2023-03-14T16:00:00.000Z',
      }
      await validation.validateJson(schemas.db.collections.events, expected)
      expect(result).toStrictEqual(expected)
    })

    it('Should build a standardized event object for a UserOperation event 2', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const networkId = '0xe15503e4'
      const eventName =
        'UserOperation(uint256 nonce,string destinationAccount,bytes4 destinationNetworkId,string underlyingAssetName,string underlyingAssetSymbol,uint256 underlyingAssetDecimals,address underlyingAssetTokenAddress,bytes4 underlyingAssetNetworkId,address assetTokenAddress,uint256 assetAmount,bytes userData,bytes32 optionsMask)'
      const eventLog = logs[2]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        networkId,
        methodInterface,
        eventLog
      )

      const expected = {
        [schemas.constants.reportFields.SCHEMA_ID_KEY]:
          'useroperation_0x62be3b1256761376f7ad4bbedd59b853a734e01b77520e6bc7d27efc10758864',
        [schemas.constants.reportFields.SCHEMA_STATUS_KEY]: constants.db.txStatus.DETECTED,
        [schemas.constants.reportFields.SCHEMA_EVENT_NAME_KEY]:
          constants.db.eventNames.USER_OPERATION,

        [schemas.constants.reportFields.SCHEMA_NONCE_KEY]: '6648',
        [schemas.constants.reportFields.SCHEMA_ASSET_AMOUNT_KEY]: '2000000000000000000',
        [schemas.constants.reportFields.SCHEMA_DESTINATION_ACCOUNT_KEY]:
          '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        [schemas.constants.reportFields.SCHEMA_DESTINATION_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_FINAL_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_FINAL_TX_TS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: 'Token',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: 'TKN',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]: 18,
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.reportFields.SCHEMA_OPTIONS_MASK]:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_BLOCK_HASH_KEY]:
          '0xbfed1379abf5ebce29b4f74a4159a0795f42f97b260199d05acdcb567d0b0b85',
        [schemas.constants.reportFields.SCHEMA_TX_HASH_KEY]:
          '0xed4fc787108745e0414cdcd24fe82afd82bbbb60d4976feefb6687253d558be8',
        [schemas.constants.reportFields.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_PROPOSAL_TS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.reportFields.SCHEMA_USER_DATA_KEY]: '0x',
        [schemas.constants.reportFields.SCHEMA_WITNESSED_TS_KEY]: '2023-03-14T16:00:00.000Z',
      }
      await validation.validateJson(schemas.db.collections.events, expected)
      expect(result).toStrictEqual(expected)
    })

    it('Should build a standardized event object for a UserOperation event 3', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const networkId = '0xe15503e4'
      const eventName =
        'UserOperation(uint256 nonce,string destinationAccount,bytes4 destinationNetworkId,string underlyingAssetName,string underlyingAssetSymbol,uint256 underlyingAssetDecimals,address underlyingAssetTokenAddress,bytes4 underlyingAssetNetworkId,address assetTokenAddress,uint256 assetAmount,bytes userData,bytes32 optionsMask)'
      const eventLog = logs[3]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        networkId,
        methodInterface,
        eventLog
      )

      const expected = {
        [schemas.constants.reportFields.SCHEMA_ID_KEY]:
          'useroperation_0xb3b4f34d53bcc3cb942d2582b740189e4027dbb7bd5c92757f8452f448c2bbb9',
        [schemas.constants.reportFields.SCHEMA_STATUS_KEY]: constants.db.txStatus.DETECTED,
        [schemas.constants.reportFields.SCHEMA_EVENT_NAME_KEY]:
          constants.db.eventNames.USER_OPERATION,

        [schemas.constants.reportFields.SCHEMA_NONCE_KEY]: '6648',
        [schemas.constants.reportFields.SCHEMA_ASSET_AMOUNT_KEY]: '3000000000000000000',
        [schemas.constants.reportFields.SCHEMA_DESTINATION_ACCOUNT_KEY]:
          '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        [schemas.constants.reportFields.SCHEMA_DESTINATION_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_FINAL_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_FINAL_TX_TS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: 'Token',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: 'TKN',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]: 18,
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.reportFields.SCHEMA_OPTIONS_MASK]:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_BLOCK_HASH_KEY]:
          '0x51a7df3cedcc76917b037b74bdd82a315f812a0cdbcac7ad70a8bce9d4150af4',
        [schemas.constants.reportFields.SCHEMA_TX_HASH_KEY]:
          '0xfad8f21a2981f49eafe79334d5b4b81fa95db5a1e40f0f633a22ad7e55b793a4',
        [schemas.constants.reportFields.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_PROPOSAL_TS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.reportFields.SCHEMA_USER_DATA_KEY]: '0x',
        [schemas.constants.reportFields.SCHEMA_WITNESSED_TS_KEY]: '2023-03-14T16:00:00.000Z',
      }
      await validation.validateJson(schemas.db.collections.events, expected)
      expect(result).toStrictEqual(expected)
    })

    it('Should build a standardized event object for a UserOperation event 4', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const networkId = '0xe15503e4'
      const eventName =
        'UserOperation(uint256 nonce,string destinationAccount,bytes4 destinationNetworkId,string underlyingAssetName,string underlyingAssetSymbol,uint256 underlyingAssetDecimals,address underlyingAssetTokenAddress,bytes4 underlyingAssetNetworkId,address assetTokenAddress,uint256 assetAmount,bytes userData,bytes32 optionsMask)'
      const eventLog = logs[4]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        networkId,
        methodInterface,
        eventLog
      )

      const expected = {
        [schemas.constants.reportFields.SCHEMA_ID_KEY]:
          'useroperation_0x7794b69ee042872159e5c4810addb698e4032ed6f4a3e1bdb94e38021d2f5146',
        [schemas.constants.reportFields.SCHEMA_STATUS_KEY]: constants.db.txStatus.DETECTED,
        [schemas.constants.reportFields.SCHEMA_EVENT_NAME_KEY]:
          constants.db.eventNames.USER_OPERATION,

        [schemas.constants.reportFields.SCHEMA_NONCE_KEY]: '6648',
        [schemas.constants.reportFields.SCHEMA_ASSET_AMOUNT_KEY]: '4000000000000000000',
        [schemas.constants.reportFields.SCHEMA_DESTINATION_ACCOUNT_KEY]:
          '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        [schemas.constants.reportFields.SCHEMA_DESTINATION_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_FINAL_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_FINAL_TX_TS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: 'Token',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: 'TKN',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]: 18,
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.reportFields.SCHEMA_OPTIONS_MASK]:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_BLOCK_HASH_KEY]:
          '0x1ed0f553eded679ce381d6d6d542971fec13b461035d0ebbfb8175910c5cd775',
        [schemas.constants.reportFields.SCHEMA_TX_HASH_KEY]:
          '0x037a7080ea701a0bf91b4f8a5f5671c3565da3dbcda916938eb597f9b4dcab2c',
        [schemas.constants.reportFields.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_PROPOSAL_TS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.reportFields.SCHEMA_USER_DATA_KEY]: '0x',
        [schemas.constants.reportFields.SCHEMA_WITNESSED_TS_KEY]: '2023-03-14T16:00:00.000Z',
      }
      await validation.validateJson(schemas.db.collections.events, expected)
      expect(result).toStrictEqual(expected)
    })

    it('Should build a standardized event object for a UserOperation event 5', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const networkId = '0xe15503e4'
      const eventName =
        'UserOperation(uint256 nonce,string destinationAccount,bytes4 destinationNetworkId,string underlyingAssetName,string underlyingAssetSymbol,uint256 underlyingAssetDecimals,address underlyingAssetTokenAddress,bytes4 underlyingAssetNetworkId,address assetTokenAddress,uint256 assetAmount,bytes userData,bytes32 optionsMask)'
      const eventLog = logs[5]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        networkId,
        methodInterface,
        eventLog
      )

      const expected = {
        [schemas.constants.reportFields.SCHEMA_ID_KEY]:
          'useroperation_0xcf021d05f8a70b96146067ba8f21cf26d00ad28fd7dc72fda247b4b87144459a',
        [schemas.constants.reportFields.SCHEMA_STATUS_KEY]: constants.db.txStatus.DETECTED,
        [schemas.constants.reportFields.SCHEMA_EVENT_NAME_KEY]:
          constants.db.eventNames.USER_OPERATION,

        [schemas.constants.reportFields.SCHEMA_NONCE_KEY]: '6648',
        [schemas.constants.reportFields.SCHEMA_ASSET_AMOUNT_KEY]: '5000000000000000000',
        [schemas.constants.reportFields.SCHEMA_DESTINATION_ACCOUNT_KEY]:
          '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        [schemas.constants.reportFields.SCHEMA_DESTINATION_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_FINAL_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_FINAL_TX_TS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: 'Token',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: 'TKN',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]: 18,
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.reportFields.SCHEMA_OPTIONS_MASK]:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_BLOCK_HASH_KEY]:
          '0x857652df471ab5d968caaa6638c7c60dd3bc71cf02ce3275e79ecf9719be57bf',
        [schemas.constants.reportFields.SCHEMA_TX_HASH_KEY]:
          '0x49ad2874e8e46263ce0dc8afdeae47c51409b183501d5a304aa2f9e2d538ec8a',
        [schemas.constants.reportFields.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_PROPOSAL_TS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.reportFields.SCHEMA_USER_DATA_KEY]: '0x',
        [schemas.constants.reportFields.SCHEMA_WITNESSED_TS_KEY]: '2023-03-14T16:00:00.000Z',
      }
      await validation.validateJson(schemas.db.collections.events, expected)
      expect(result).toStrictEqual(expected)
    })

    it('Should build a standardized event object for a UserOperation event 6', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const networkId = '0xe15503e4'
      const eventName =
        'UserOperation(uint256 nonce,string destinationAccount,bytes4 destinationNetworkId,string underlyingAssetName,string underlyingAssetSymbol,uint256 underlyingAssetDecimals,address underlyingAssetTokenAddress,bytes4 underlyingAssetNetworkId,address assetTokenAddress,uint256 assetAmount,bytes userData,bytes32 optionsMask)'
      const eventLog = logs[6]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        networkId,
        methodInterface,
        eventLog
      )

      const expected = {
        [schemas.constants.reportFields.SCHEMA_ID_KEY]:
          'useroperation_0x2ca0c7c469fbee9866b12c9c28b682d832782a3ee515832ad1e195953bc94d26',
        [schemas.constants.reportFields.SCHEMA_STATUS_KEY]: constants.db.txStatus.DETECTED,
        [schemas.constants.reportFields.SCHEMA_EVENT_NAME_KEY]:
          constants.db.eventNames.USER_OPERATION,

        [schemas.constants.reportFields.SCHEMA_NONCE_KEY]: '6649',
        [schemas.constants.reportFields.SCHEMA_ASSET_AMOUNT_KEY]: '6000000000000000000',
        [schemas.constants.reportFields.SCHEMA_DESTINATION_ACCOUNT_KEY]:
          '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        [schemas.constants.reportFields.SCHEMA_DESTINATION_NETWORK_ID_KEY]: '0xf9b459a1',
        [schemas.constants.reportFields.SCHEMA_FINAL_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_FINAL_TX_TS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: 'Token',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: 'TKN',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]: 18,
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.reportFields.SCHEMA_OPTIONS_MASK]:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_BLOCK_HASH_KEY]:
          '0x2eeefc9258765455e8e347c7e6b2e3b167afbf2354e6cafd30049c6fc5f4d010',
        [schemas.constants.reportFields.SCHEMA_TX_HASH_KEY]:
          '0x2b948164aad1517cdcd11e22c3f96d58b146fdee233ab74e46cb038afcc273e3',
        [schemas.constants.reportFields.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_PROPOSAL_TS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.reportFields.SCHEMA_USER_DATA_KEY]: '0x',
        [schemas.constants.reportFields.SCHEMA_WITNESSED_TS_KEY]: '2023-03-14T16:00:00.000Z',
      }
      await validation.validateJson(schemas.db.collections.events, expected)
      expect(result).toStrictEqual(expected)
    })

    it('Should build a standardized event object for a UserOperation event 7', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const chainId = '0xe15503e4'
      const eventName =
        'UserOperation(uint256 nonce,string destinationAccount,bytes4 destinationNetworkId,string underlyingAssetName,string underlyingAssetSymbol,uint256 underlyingAssetDecimals,address underlyingAssetTokenAddress,bytes4 underlyingAssetNetworkId,address assetTokenAddress,uint256 assetAmount,bytes userData,bytes32 optionsMask)'
      const eventLog = logs[8]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        chainId,
        methodInterface,
        eventLog
      )

      const expected = {
        [schemas.constants.reportFields.SCHEMA_ID_KEY]:
          'useroperation_0x32fe2ff93d26184c87287d7b8d3d92f48f6224dd79b353eadeacf1e399378c08',
        [schemas.constants.reportFields.SCHEMA_STATUS_KEY]: constants.db.txStatus.DETECTED,
        [schemas.constants.reportFields.SCHEMA_EVENT_NAME_KEY]:
          constants.db.eventNames.USER_OPERATION,

        [schemas.constants.reportFields.SCHEMA_NONCE_KEY]: '6911',
        [schemas.constants.reportFields.SCHEMA_ASSET_AMOUNT_KEY]: '7000000000000000000',
        [schemas.constants.reportFields.SCHEMA_DESTINATION_ACCOUNT_KEY]:
          '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        [schemas.constants.reportFields.SCHEMA_DESTINATION_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_FINAL_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_FINAL_TX_TS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: 'Token',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: 'TKN',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]: 18,
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.reportFields.SCHEMA_OPTIONS_MASK]:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_BLOCK_HASH_KEY]:
          '0xf085786d855e220305a67f95653bd9345956b211095b7403e54da1b40699cb86',
        [schemas.constants.reportFields.SCHEMA_TX_HASH_KEY]:
          '0x8ac05c2472b3a507f042557ee2c137d112a26d188fb267566b53c28975322452',
        [schemas.constants.reportFields.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_PROPOSAL_TS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.reportFields.SCHEMA_USER_DATA_KEY]: '0xc0ffee',
        [schemas.constants.reportFields.SCHEMA_WITNESSED_TS_KEY]: '2023-03-14T16:00:00.000Z',
      }
      await validation.validateJson(schemas.db.collections.events, expected)
      expect(result).toStrictEqual(expected)
    })

    it('Should build a standardized event object for a OperationQueued event 1', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const chainId = '0xe15503e4'
      const eventName =
        'OperationQueued(tuple(bytes32 originBlockHash, bytes32 originTransactionHash, bytes32 optionsMask, uint256 nonce, uint256 underlyingAssetDecimals, uint256 amount, address underlyingAssetTokenAddress, bytes4 originNetworkId, bytes4 destinationNetworkId, bytes4 underlyingAssetNetworkId, string destinationAccount, string underlyingAssetName, string underlyingAssetSymbol, bytes userData) operation)'
      const eventLog = logs[7]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        chainId,
        methodInterface,
        eventLog
      )

      const expected = {
        [schemas.constants.reportFields.SCHEMA_ID_KEY]:
          'operationqueued_0x0373cb2ceeafd11a18902d21a0edbd7f3651ee3cea09442a12c060115a97bda1',
        [schemas.constants.reportFields.SCHEMA_STATUS_KEY]: constants.db.txStatus.DETECTED,
        [schemas.constants.reportFields.SCHEMA_EVENT_NAME_KEY]:
          constants.db.eventNames.QUEUED_OPERATION,

        [schemas.constants.reportFields.SCHEMA_NONCE_KEY]: '6648',
        [schemas.constants.reportFields.SCHEMA_ASSET_AMOUNT_KEY]: '1000000000000000000',
        [schemas.constants.reportFields.SCHEMA_DESTINATION_ACCOUNT_KEY]:
          '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        [schemas.constants.reportFields.SCHEMA_DESTINATION_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_FINAL_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_FINAL_TX_TS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: 'Token',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: 'TKN',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]: 18,
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.reportFields.SCHEMA_OPTIONS_MASK]:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]:
          '0xbaa9e89896c03366c3578a4568a6defd4b127e4b09bb06b67a12cb1a4c332376',
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_TX_HASH_KEY]:
          '0x0907eefad58dfcb2cbfad66d29accd4d6ddc345851ec1d180b23122084fa2820',
        [schemas.constants.reportFields.SCHEMA_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_BLOCK_HASH_KEY]:
          '0xb58eef9c0844fc69bc52ec679ca476419f7b2edf1aff430206f54e8081ec6da8',
        [schemas.constants.reportFields.SCHEMA_TX_HASH_KEY]:
          '0x302eac6bc7e18c649d58a8fc6137515914e9048aad6c6d000c2efea1dfed517f',
        [schemas.constants.reportFields.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_PROPOSAL_TS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_USER_DATA_KEY]: '0x',
        [schemas.constants.reportFields.SCHEMA_WITNESSED_TS_KEY]: '2023-03-14T16:00:00.000Z',
      }
      await validation.validateJson(schemas.db.collections.events, expected)
      expect(result).toStrictEqual(expected)
    })

    it('Should build a standardized event object for a OperationQueued event 2', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const chainId = '0xe15503e4'
      const eventName =
        'OperationQueued(tuple(bytes32 originBlockHash, bytes32 originTransactionHash, bytes32 optionsMask, uint256 nonce, uint256 underlyingAssetDecimals, uint256 amount, address underlyingAssetTokenAddress, bytes4 originNetworkId, bytes4 destinationNetworkId, bytes4 underlyingAssetNetworkId, string destinationAccount, string underlyingAssetName, string underlyingAssetSymbol, bytes userData) operation)'
      const eventLog = logs[9]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        chainId,
        methodInterface,
        eventLog
      )

      const expected = {
        [schemas.constants.reportFields.SCHEMA_ID_KEY]:
          'operationqueued_0x32fe2ff93d26184c87287d7b8d3d92f48f6224dd79b353eadeacf1e399378c08',
        [schemas.constants.reportFields.SCHEMA_STATUS_KEY]: constants.db.txStatus.DETECTED,
        [schemas.constants.reportFields.SCHEMA_EVENT_NAME_KEY]:
          constants.db.eventNames.QUEUED_OPERATION,

        [schemas.constants.reportFields.SCHEMA_NONCE_KEY]: '6911',
        [schemas.constants.reportFields.SCHEMA_ASSET_AMOUNT_KEY]: '7000000000000000000',
        [schemas.constants.reportFields.SCHEMA_DESTINATION_ACCOUNT_KEY]:
          '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        [schemas.constants.reportFields.SCHEMA_DESTINATION_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_FINAL_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_FINAL_TX_TS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: 'Token',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: 'TKN',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]: 18,
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]:
          '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        [schemas.constants.reportFields.SCHEMA_OPTIONS_MASK]:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]:
          '0xf085786d855e220305a67f95653bd9345956b211095b7403e54da1b40699cb86',
        [schemas.constants.reportFields.SCHEMA_ORIGINATING_TX_HASH_KEY]:
          '0x8ac05c2472b3a507f042557ee2c137d112a26d188fb267566b53c28975322452',
        [schemas.constants.reportFields.SCHEMA_NETWORK_ID_KEY]: '0xe15503e4',
        [schemas.constants.reportFields.SCHEMA_BLOCK_HASH_KEY]:
          '0x8e4479cd521acad9deae47ec04cfcd3d5c28ab30686b3a8581c7d88980bbf35b',
        [schemas.constants.reportFields.SCHEMA_TX_HASH_KEY]:
          '0x153ad9b1613eeaf1234d8d430e2d3e22821f931d33d6f42de7e6ac0f95e87521',
        [schemas.constants.reportFields.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_PROPOSAL_TS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]: null,
        [schemas.constants.reportFields.SCHEMA_USER_DATA_KEY]: '0xc0ffee',
        [schemas.constants.reportFields.SCHEMA_WITNESSED_TS_KEY]: '2023-03-14T16:00:00.000Z',
      }
      await validation.validateJson(schemas.db.collections.events, expected)
      expect(result).toStrictEqual(expected)
    })
  })
})
