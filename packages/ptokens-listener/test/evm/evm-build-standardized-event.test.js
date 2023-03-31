const { logs } = require('../mock/evm-logs')
const { getInterfaceFromEvent } = require('../../lib/evm/listener-evm')
const schemas = require('ptokens-schemas')
const { validation } = require('ptokens-utils')

describe('Event building for EVM', () => {
  describe('buildStandardizedEventFromEvmEvent', () => {
    beforeAll(() => {
      jest
        .useFakeTimers({ legacyFakeTimers: false })
        .setSystemTime(new Date('2023-03-14T16:00:00Z'))
    })

    it('Should build a standardized event object for a UserOperation event', async () => {
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
          '0xf59387e05541d3d7690e8d54444179492f4b48a18106d94b1260e3560cf14acf',
        [schemas.constants.SCHEMA_STATUS_KEY]:
          schemas.db.enums.txStatus.DETECTED,
        [schemas.constants.SCHEMA_EVENT_NAME_KEY]:
          schemas.db.enums.eventNames.USER_OPERATION,

        [schemas.constants.SCHEMA_NONCE_KEY]: '103383',
        [schemas.constants.SCHEMA_ASSET_AMOUNT_KEY]: '100000000000000000000',
        [schemas.constants.SCHEMA_DESTINATION_ACCOUNT_KEY]:
          '0xa41657bf225F8Ec7E2010C89c3F084172948264D',
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
          '0x509580316faa053e500a1cdba70359354d1f8d52ba7e8b7a90fc61e33a67f785',
        [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
          '0x3f0a8aba3cc598f9e4fc851022044966238a9a9ab959c5130d9fa483204978f2',
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
