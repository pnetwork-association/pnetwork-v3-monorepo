const ethers = require('ethers')
const { logs } = require('../mock/evm-logs')

describe('Get EVM operations by Operation ID', () => {
  describe('getOperationsById', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('Should get operations linked to an Operation ID', async () => {
      const getLogsSpy = jest
        .spyOn(ethers.AbstractProvider.prototype, 'getLogs')
        .mockResolvedValue([logs[10]])
      const fakeProvider = {
        getLogs: getLogsSpy,
      }
      const getDefaultProviderSpy = jest
        .spyOn(ethers, 'getDefaultProvider')
        .mockImplementation(_url => fakeProvider)

      const { getEvmOperationsById } = require('../../lib/evm/evm-get-operations-by-id')
      const provider = 'mumbai-provider-url-1'
      const networkId = 'network-id'
      const operationId = '0x46840d7667c567d8ae702801c296d9cb19535d7c77f8e132c79f06c25df79600'
      const stateManagerAddress = '0x565033350582f4Ad298fDD8d59b7c36D0cAC1712'
      const fromBlock = 34923840
      const ret = await getEvmOperationsById(
        provider,
        networkId,
        operationId,
        stateManagerAddress,
        fromBlock
      )
      expect(getDefaultProviderSpy).toHaveBeenNthCalledWith(1, provider)
      expect(getLogsSpy).toHaveBeenNthCalledWith(1, {
        address: stateManagerAddress,
        fromBlock: 34923840,
        topics: [
          [
            '0xec5d8f38737ebccaa579d2caeaed8fbc5f2c7c598fee1eb335429c8c48ec2598',
            '0xfb83c807750a326c5845536dc89b4d2da9f1f5e0df344e9f69f27c84f4d7d726',
            '0xd1a85d51ecfea5edd75f97fcf615b22c6f56eaf8f0487db9fadfbe661689b9af',
          ],
        ],
      })
      expect(ret).toStrictEqual([
        {
          eventName: 'OperationQueued',
          txHash: '0x2eff067a18db079a26a9f26e22c404dd6f68c5f377935db0afd913a59a1ede02',
        },
      ])
    })

    it('Should get an empty array of operations when there are no logs', async () => {
      const getLogsSpy = jest
        .spyOn(ethers.AbstractProvider.prototype, 'getLogs')
        .mockResolvedValue([])
      const fakeProvider = {
        getLogs: getLogsSpy,
      }
      const getDefaultProviderSpy = jest
        .spyOn(ethers, 'getDefaultProvider')
        .mockImplementation(_url => fakeProvider)

      const { getEvmOperationsById } = require('../../lib/evm/evm-get-operations-by-id')
      const provider = 'mumbai-provider-url-2'
      const networkId = 'network-id'
      const operationId = '0x2eff067a18db079a26a9f26e22c404dd6f68c5f377935db0afd913a59a1ede02'
      const stateManagerAddress = '0x565033350582f4Ad298fDD8d59b7c36D0cAC1712'
      const fromBlock = 34923840
      const ret = await getEvmOperationsById(
        provider,
        networkId,
        operationId,
        stateManagerAddress,
        fromBlock
      )
      expect(getDefaultProviderSpy).toHaveBeenNthCalledWith(1, provider)
      expect(getLogsSpy).toHaveBeenNthCalledWith(1, {
        address: stateManagerAddress,
        fromBlock: 34923840,
        topics: [
          [
            '0xec5d8f38737ebccaa579d2caeaed8fbc5f2c7c598fee1eb335429c8c48ec2598',
            '0xfb83c807750a326c5845536dc89b4d2da9f1f5e0df344e9f69f27c84f4d7d726',
            '0xd1a85d51ecfea5edd75f97fcf615b22c6f56eaf8f0487db9fadfbe661689b9af',
          ],
        ],
      })
      expect(ret).toStrictEqual([])
    })
  })
})
