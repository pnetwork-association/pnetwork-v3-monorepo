const { logs } = require('../mock/evm-logs')
const { getInterfaceFromEvent } = require('../../lib/evm/listener-evm')

describe('Event building for EVM', () => {
  describe('buildStandardizedEventFromEvmEvent', () => {
    it('Should parse the args correctly', async () => {
      const {
        buildStandardizedEventFromEvmEvent,
      } = require('../../lib/evm/listener-evm')
      const chainId = '0x005fe7f9'
      const eventName =
        'Redeem(address indexed redeemer, uint256 value, string underlyingAssetRecipient, bytes userData, bytes4 originChainId, bytes4 destinationChainId)'
      const eventLog = logs[2]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const parsedLog = methodInterface.parseLog(eventLog)
      const result = await buildStandardizedEventFromEvmEvent(
        chainId,
        parsedLog
      )

      expect(result).toStrictEqual({
        amount: '2065832100000000000',
        destinationAddress: '35eXzETyUxiQPXwU2udtVFQFrFjgRhhvPj',
        destinationChainId: '0x01ec97de',
        eventName: 'Redeem',
        status: 'detected',
        originatingChainId: '0x005fe7f9',
      })
    })
  })
})
