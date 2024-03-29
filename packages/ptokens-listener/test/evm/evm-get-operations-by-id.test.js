const ethers = require('ethers')
const constants = require('ptokens-constants')
const { logs } = require('../mock/evm-logs')

describe('Get EVM operations by Operation ID', () => {
  describe('getOperationsById', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('Should get operations linked to an Operation ID', async () => {
      const getLogsSpy = jest
        .spyOn(ethers.providers.BaseProvider.prototype, 'getLogs')
        .mockResolvedValue([logs[2]])
      const fakeProvider = {
        getLogs: getLogsSpy,
      }
      const getDefaultProviderSpy = jest
        .spyOn(ethers.providers, 'JsonRpcProvider')
        .mockImplementation(_url => fakeProvider)

      const { getEvmOperationsById } = require('../../lib/evm/evm-get-operations-by-id')
      const provider = 'polygon-provider-url-1'
      const networkId = constants.networkIds.POLYGON_MAINNET
      const operationId = '0x73d96bb1831f73f4f47269f312b2131ca7a3becc4ccf8f53d5352575013c9378' // secretlint-disable-line
      const hubAddress = '0xD64363f98aBf755f92D5cA89C57CDbc8d3D05F9c'
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
            '0x0b9d0b9c6d9aae1efe690e3f8c347a95a78fc08968c2b0a2381e11799e82ecce', // secretlint-disable-line
            '0x0dd9442ca0ceb76d843508ae85c58c2ef3742491a1cc480e4c0d1c96ab9965a6', // secretlint-disable-line
            '0xe7bf22971bde3dd8a6a3bf8434e8b7a7c7554dad8328f741da1484d67b445c19', // secretlint-disable-line
          ],
        ],
      })
      expect(ret).toMatchSnapshot()
    })

    it('Should get an empty array of operations when there are no logs', async () => {
      const getLogsSpy = jest
        .spyOn(ethers.providers.BaseProvider.prototype, 'getLogs')
        .mockResolvedValue([])
      const fakeProvider = {
        getLogs: getLogsSpy,
      }
      const getDefaultProviderSpy = jest
        .spyOn(ethers.providers, 'JsonRpcProvider')
        .mockImplementation(_url => fakeProvider)

      const { getEvmOperationsById } = require('../../lib/evm/evm-get-operations-by-id')
      const provider = 'polygon-provider-url-2'
      const networkId = constants.networkIds.POLYGON_MAINNET
      const operationId = '0x2eff067a18db079a26a9f26e22c404dd6f68c5f377935db0afd913a59a1ede02' // secretlint-disable-line
      const hubAddress = '0xd2bac275fffdbdd23ecea72f4b161b3af90300a3'
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
            '0x0b9d0b9c6d9aae1efe690e3f8c347a95a78fc08968c2b0a2381e11799e82ecce', // secretlint-disable-line
            '0x0dd9442ca0ceb76d843508ae85c58c2ef3742491a1cc480e4c0d1c96ab9965a6', // secretlint-disable-line
            '0xe7bf22971bde3dd8a6a3bf8434e8b7a7c7554dad8328f741da1484d67b445c19', // secretlint-disable-line
          ],
        ],
      })
      expect(ret).toStrictEqual([])
    })
  })
})
