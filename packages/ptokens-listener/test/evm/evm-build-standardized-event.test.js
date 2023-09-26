const { logs } = require('../mock/evm-logs')
const constants = require('ptokens-constants')
const { getInterfaceFromEvent } = require('../../lib/evm/evm-utils')

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
      const networkId = '0x5aca268b'
      const eventName = constants.evm.events.USER_OPERATION_SIGNATURE
      const eventLog = logs[0]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        networkId,
        methodInterface,
        eventLog
      )

      const expected = {
        [constants.db.KEY_ID]:
          'useroperation_0xd9feb6e60cd73c396cbaeb3e5fa55c774c03a274c54f5bc53a62a59855ec7cc4',
        [constants.db.KEY_STATUS]: constants.db.txStatus.DETECTED,
        [constants.db.KEY_EVENT_NAME]: constants.db.eventNames.USER_OPERATION,

        [constants.db.KEY_NONCE]: '98322',
        [constants.db.KEY_ASSET_AMOUNT]: '200000',
        [constants.db.KEY_DESTINATION_ACCOUNT]: '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        [constants.db.KEY_DESTINATION_NETWORK_ID]: '0xf9b459a1',
        [constants.db.KEY_FINAL_TX_HASH]: null,
        [constants.db.KEY_FINAL_TX_TS]: null,
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
        [constants.db.KEY_NETWORK_ID]: '0x5aca268b',
        [constants.db.KEY_BLOCK_HASH]:
          '0x05cf0e83408207704ee0ea2a4a6ea87905fc0d2038dbb610a0ca64f2cf47b134',
        [constants.db.KEY_TX_HASH]:
          '0xb1bb8b6502edc17fdd0cc83505289a6d429a6381ffe5dbf4fe31a88dd236d643',
        [constants.db.KEY_PROPOSAL_TX_HASH]: null,
        [constants.db.KEY_PROPOSAL_TS]: null,
        [constants.db.KEY_ASSET_TOKEN_ADDRESS]: '0xdaacB0Ab6Fb34d24E8a67BfA14BF4D95D4C7aF92',
        [constants.db.KEY_USER_DATA]: '0x',
        [constants.db.KEY_WITNESSED_TS]: '2023-03-14T16:00:00.000Z',
        [constants.db.KEY_FORWARD_DESTINATION_NETWORK_ID]: '0xb9286154',
        [constants.db.KEY_FORWARD_NETWORK_FEE_ASSET_AMOUNT]: '2000',
        [constants.db.KEY_NETWORK_FEE_ASSET_AMOUNT]: '1000',
        [constants.db.KEY_PROTOCOL_FEE_ASSET_AMOUNT]: '0',
        [constants.db.KEY_IS_FOR_PROTOCOL]: false,
      }
      await validation.validateJson(constants.db.schemas.eventReport, expected)
      expect(result).toStrictEqual(expected)
    })

    it('Should build a standardized event object for a OperationQueued event 1', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const chainId = '0xe15503e4'
      const eventName = constants.evm.events.OPERATION_QUEUED_SIGNATURE
      const eventLog = logs[4]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        chainId,
        methodInterface,
        eventLog
      )

      const expected = {
        [constants.db.KEY_ID]:
          'operationqueued_0xd9feb6e60cd73c396cbaeb3e5fa55c774c03a274c54f5bc53a62a59855ec7cc4',
        [constants.db.KEY_STATUS]: constants.db.txStatus.PROPOSED,
        [constants.db.KEY_EVENT_NAME]: constants.db.eventNames.QUEUED_OPERATION,

        [constants.db.KEY_NONCE]: '98322',
        [constants.db.KEY_ASSET_AMOUNT]: '200000',
        [constants.db.KEY_DESTINATION_ACCOUNT]: '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        [constants.db.KEY_DESTINATION_NETWORK_ID]: '0xf9b459a1',
        [constants.db.KEY_FINAL_TX_HASH]: null,
        [constants.db.KEY_FINAL_TX_TS]: null,
        [constants.db.KEY_FORWARD_DESTINATION_NETWORK_ID]: '0xb9286154',
        [constants.db.KEY_FORWARD_NETWORK_FEE_ASSET_AMOUNT]: '2000',
        [constants.db.KEY_NETWORK_FEE_ASSET_AMOUNT]: '1000',
        [constants.db.KEY_UNDERLYING_ASSET_NAME]: 'pNetwork Token',
        [constants.db.KEY_UNDERLYING_ASSET_SYMBOL]: 'PNT',
        [constants.db.KEY_UNDERLYING_ASSET_DECIMALS]: 18,
        [constants.db.KEY_UNDERLYING_ASSET_NETWORK_ID]: '0x5aca268b',
        [constants.db.KEY_UNDERLYING_ASSET_TOKEN_ADDRESS]:
          '0xdaacB0Ab6Fb34d24E8a67BfA14BF4D95D4C7aF92',
        [constants.db.KEY_OPTIONS_MASK]:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        [constants.db.KEY_ORIGINATING_NETWORK_ID]: '0x5aca268b',
        [constants.db.KEY_ORIGINATING_ADDRESS]: '0xddb5f4535123daa5ae343c24006f4075abaf5f7b',
        [constants.db.KEY_ORIGINATING_BLOCK_HASH]:
          '0x05cf0e83408207704ee0ea2a4a6ea87905fc0d2038dbb610a0ca64f2cf47b134',
        [constants.db.KEY_ORIGINATING_TX_HASH]:
          '0xb1bb8b6502edc17fdd0cc83505289a6d429a6381ffe5dbf4fe31a88dd236d643',
        [constants.db.KEY_NETWORK_ID]: '0xe15503e4',
        [constants.db.KEY_BLOCK_HASH]:
          '0xfa7f1989507da8e2bd7be30ab9064c9819d34f2b43f77d8eba3c15f427486a46',
        [constants.db.KEY_TX_HASH]:
          '0x9a6123eaa2acd909f2314e3fd0e799ce316ef301e5625aa5f89d1a70ba80e96b',
        [constants.db.KEY_PROPOSAL_TX_HASH]: null,
        [constants.db.KEY_PROPOSAL_TS]: null,
        [constants.db.KEY_PROTOCOL_FEE_ASSET_AMOUNT]: '0',
        [constants.db.KEY_ASSET_TOKEN_ADDRESS]: null,
        [constants.db.KEY_USER_DATA]: '0x',
        [constants.db.KEY_WITNESSED_TS]: '2023-03-14T16:00:00.000Z',
        [constants.db.KEY_IS_FOR_PROTOCOL]: false,
      }
      await validation.validateJson(constants.db.schemas.eventReport, expected)
      expect(result).toStrictEqual(expected)
    })

    it('Should build a standardized event object for a OperationExecuted event 1', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const chainId = '0xe15503e4'
      const eventName = constants.evm.events.OPERATION_EXECUTED_SIGNATURE
      const eventLog = logs[2]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        chainId,
        methodInterface,
        eventLog
      )

      const expected = {
        [constants.db.KEY_ID]:
          'operationexecuted_0xd9feb6e60cd73c396cbaeb3e5fa55c774c03a274c54f5bc53a62a59855ec7cc4',
        [constants.db.KEY_STATUS]: constants.db.txStatus.DETECTED,
        [constants.db.KEY_EVENT_NAME]: constants.db.eventNames.EXECUTED_OPERATION,
        [constants.db.KEY_NONCE]: '98322',
        [constants.db.KEY_ASSET_AMOUNT]: '200000',
        [constants.db.KEY_DESTINATION_ACCOUNT]: '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        [constants.db.KEY_DESTINATION_NETWORK_ID]: '0xf9b459a1',
        [constants.db.KEY_FINAL_TX_HASH]: null,
        [constants.db.KEY_FINAL_TX_TS]: null,
        [constants.db.KEY_FORWARD_DESTINATION_NETWORK_ID]: '0xb9286154',
        [constants.db.KEY_FORWARD_NETWORK_FEE_ASSET_AMOUNT]: '2000',
        [constants.db.KEY_NETWORK_FEE_ASSET_AMOUNT]: '1000',
        [constants.db.KEY_UNDERLYING_ASSET_NAME]: 'pNetwork Token',
        [constants.db.KEY_UNDERLYING_ASSET_SYMBOL]: 'PNT',
        [constants.db.KEY_UNDERLYING_ASSET_DECIMALS]: 18,
        [constants.db.KEY_UNDERLYING_ASSET_NETWORK_ID]: '0x5aca268b',
        [constants.db.KEY_UNDERLYING_ASSET_TOKEN_ADDRESS]:
          '0xdaacB0Ab6Fb34d24E8a67BfA14BF4D95D4C7aF92',
        [constants.db.KEY_OPTIONS_MASK]:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        [constants.db.KEY_ORIGINATING_NETWORK_ID]: '0x5aca268b',
        [constants.db.KEY_ORIGINATING_ADDRESS]: '0xddb5f4535123daa5ae343c24006f4075abaf5f7b',
        [constants.db.KEY_ORIGINATING_BLOCK_HASH]:
          '0x05cf0e83408207704ee0ea2a4a6ea87905fc0d2038dbb610a0ca64f2cf47b134',
        [constants.db.KEY_ORIGINATING_TX_HASH]:
          '0xb1bb8b6502edc17fdd0cc83505289a6d429a6381ffe5dbf4fe31a88dd236d643',
        [constants.db.KEY_NETWORK_ID]: '0xe15503e4',
        [constants.db.KEY_BLOCK_HASH]:
          '0x0fc3588f727dde10ccd937b04f5666fb04e39553b4c73719555acd7a6a430764',
        [constants.db.KEY_TX_HASH]:
          '0xa5c5838123aa37d2efd69285f7b6bd8c2e93d4cf243d45926169502c13b23a49',
        [constants.db.KEY_PROPOSAL_TX_HASH]: null,
        [constants.db.KEY_PROPOSAL_TS]: null,
        [constants.db.KEY_PROTOCOL_FEE_ASSET_AMOUNT]: '0',
        [constants.db.KEY_ASSET_TOKEN_ADDRESS]: null,
        [constants.db.KEY_USER_DATA]: '0x',
        [constants.db.KEY_WITNESSED_TS]: '2023-03-14T16:00:00.000Z',
        [constants.db.KEY_IS_FOR_PROTOCOL]: false,
      }
      await validation.validateJson(constants.db.schemas.eventReport, expected)
      expect(result).toStrictEqual(expected)
    })
  })
})
