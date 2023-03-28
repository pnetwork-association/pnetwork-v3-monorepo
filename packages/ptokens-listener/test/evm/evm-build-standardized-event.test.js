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
      const eventName =
        'UserOperation(uint256 nonce, string destinationAccount, bytes4 destinationNetworkId, address underlyingAssetTokenAddress, string underlyingAssetName, string underlyingAssetSymbol, bytes4 underlyingAssetChainId, address assetTokenAddress, uint256 assetAmount, bytes userData, bytes optionsMask)'
      const eventLog = logs[3]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        methodInterface,
        eventLog
      )
      await validation.validateJson(schemas.db.collections.events, result)

      const expected = {
        _id: '0x9488dee8cb5c6b2f6299e45e48bba580f46dbd496cfaa70a182060fd5dc81cb5',
        [schemas.constants.SCHEMA_STATUS_KEY]:
          schemas.db.enums.txStatus.DETECTED,
        [schemas.constants.SCHEMA_EVENT_NAME_KEY]:
          schemas.db.enums.eventNames.USER_OPERATION,

        [schemas.constants.SCHEMA_NONCE_KEY]: '1',
        [schemas.constants.SCHEMA_AMOUNT_KEY]: '1',
        [schemas.constants.SCHEMA_DESTINATION_ADDRESS_KEY]:
          '0xc39867e393cb061b837240862d9ad318c176a96d',
        [schemas.constants.SCHEMA_DESTINATION_NETWORK_ID_KEY]: '0x00e4b170',

        [schemas.constants.SCHEMA_FINAL_TX_HASH_KEY]: null,
        [schemas.constants.SCHEMA_FINAL_TX_TS_KEY]: null,
        [schemas.constants.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_CHAIN_ID_KEY]:
          '0x00000001',
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]:
          '0x89Ab32156e46F46D02ade3FEcbe5Fc4243B9AAeD',
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: 'PNT',
        [schemas.constants.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: 'PNT',
        [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
          '0x9488dee8cb5c6b2f6299e45e48bba580f46dbd496cfaa70a182060fd5dc81cb5',
        [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
        [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: null,
        [schemas.constants.SCHEMA_TOKEN_ADDRESS_KEY]:
          '0x89Ab32156e46F46D02ade3FEcbe5Fc4243B9AAeD',
        [schemas.constants.SCHEMA_USER_DATA_KEY]: null,
        [schemas.constants.SCHEMA_WITNESSED_TS_KEY]: '2023-03-14T16:00:00.000Z',
      }
      await validation.validateJson(schemas.db.collections.events, expected)
      expect(result).toStrictEqual(expected)
    })
  })
})
