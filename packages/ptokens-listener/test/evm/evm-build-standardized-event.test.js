const { logs } = require('../mock/evm-logs')
const constants = require('ptokens-constants')
const { getInterfaceFromEventSignatures } = require('../../lib/evm/evm-utils')

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
      const methodInterface = await getInterfaceFromEventSignatures([eventName])
      const result = await buildStandardizedEvmEventObjectFromLog(
        networkId,
        methodInterface,
        eventLog
      )
      expect(result).toMatchSnapshot()
    })

    it('Should build a standardized event object for a OperationQueued event 1', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const chainId = '0xe15503e4'
      const eventName = constants.evm.events.OPERATION_QUEUED_SIGNATURE
      const eventLog = logs[4]
      const methodInterface = await getInterfaceFromEventSignatures([eventName])
      const result = await buildStandardizedEvmEventObjectFromLog(
        chainId,
        methodInterface,
        eventLog
      )
      expect(result).toMatchSnapshot()
    })

    it('Should build a standardized event object for a OperationExecuted event 1', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const chainId = '0xe15503e4'
      const eventName = constants.evm.events.OPERATION_EXECUTED_SIGNATURE
      const eventLog = logs[2]
      const methodInterface = await getInterfaceFromEventSignatures([eventName])
      const result = await buildStandardizedEvmEventObjectFromLog(
        chainId,
        methodInterface,
        eventLog
      )
      expect(result).toMatchSnapshot()
    })
  })
})
