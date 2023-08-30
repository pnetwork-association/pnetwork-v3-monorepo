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
        .mockResolvedValue([logs[2]])
      const fakeProvider = {
        getLogs: getLogsSpy,
      }
      const getDefaultProviderSpy = jest
        .spyOn(ethers, 'getDefaultProvider')
        .mockImplementation(_url => fakeProvider)

      const { getEvmOperationsById } = require('../../lib/evm/evm-get-operations-by-id')
      const provider = 'polygon-provider-url-1'
      const networkId = 'polygon-network-id'
      const operationId = '0x0e629afc57c3f95207c44fee302cedb89c7051b99df35847586b569073e8f425'
      const hubAddress = '0xc2d9C83d98ba36f295Cf61B7496332075d16dc8e'
      const fromBlock = 45583400
      const ret = await getEvmOperationsById(
        provider,
        networkId,
        operationId,
        hubAddress,
        fromBlock
      )
      expect(getDefaultProviderSpy).toHaveBeenNthCalledWith(1, provider)
      expect(getLogsSpy).toHaveBeenNthCalledWith(1, {
        address: hubAddress,
        fromBlock: 45583400,
        topics: [
          [
            '0x029f1f67ab657b4c5a9616439b2bf263a1f4858077c10dd4e9bc4fea817fca37',
            '0x3be31efdb29ca9b3c04d3eb94096006add1f157e835694c28ca864eb6dce3504',
            '0xcdfe48ba923cd8bcac4fe88fe6c0b5a8e443f4b91e0751bc2b2b8917c03ae066',
          ],
        ],
      })
      expect(ret).toStrictEqual([
        {
          eventName: 'OperationExecuted',
          txHash: '0x260d51e9aac08601fb948b137b41a672244efbf72b8c107949937dcec8bd3175',
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
      const hubAddress = '0x565033350582f4Ad298fDD8d59b7c36D0cAC1712'
      const fromBlock = 34923840
      const ret = await getEvmOperationsById(
        provider,
        networkId,
        operationId,
        hubAddress,
        fromBlock
      )
      expect(getDefaultProviderSpy).toHaveBeenNthCalledWith(1, provider)
      expect(getLogsSpy).toHaveBeenNthCalledWith(1, {
        address: hubAddress,
        fromBlock: 34923840,
        topics: [
          [
            '0x029f1f67ab657b4c5a9616439b2bf263a1f4858077c10dd4e9bc4fea817fca37',
            '0x3be31efdb29ca9b3c04d3eb94096006add1f157e835694c28ca864eb6dce3504',
            '0xcdfe48ba923cd8bcac4fe88fe6c0b5a8e443f4b91e0751bc2b2b8917c03ae066',
          ],
        ],
      })
      expect(ret).toStrictEqual([])
    })
  })
})
