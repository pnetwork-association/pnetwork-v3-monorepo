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

    it('Should build a standardized event object for a Redeem event', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const chainId = '0x005fe7f9'
      const eventName =
        'UserOperation(uint256 nonce,string destinationAccount,bytes4 destinationNetworkId,string underlyingAssetName,string underlyingAssetSymbol,uint256 underlyingAssetDecimals,address underlyingAssetTokenAddress,bytes4 underlyingAssetNetworkId,address assetTokenAddress,uint256 assetAmount,bytes userData,bytes32 optionsMask)'
      const eventLog = logs[3]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        chainId,
        methodInterface,
        eventLog
      )
      await validation.validateJson(schemas.db.collections.events, result)

      const expected = {
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
        [schemas.constants.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
        [schemas.constants.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: '0x005fe7f9',
        [schemas.constants.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]:
          '0x0fc80f64b06f1de7e0025968e1acea1c8098e99da995654bc8f28b86a5efc8bf',
        [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
          '0x9488dee8cb5c6b2f6299e45e48bba580f46dbd496cfaa70a182060fd5dc81cb5',
        [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
        [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: null,
        [schemas.constants.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]:
          '0x89Ab32156e46F46D02ade3FEcbe5Fc4243B9AAeD',
        [schemas.constants.SCHEMA_USER_DATA_KEY]: '0x',
        [schemas.constants.SCHEMA_WITNESSED_TS_KEY]: '2023-03-14T16:00:00.000Z',
      }
      await validation.validateJson(schemas.db.collections.events, expected)
      expect(result).toStrictEqual(expected)
    })
  })
})
