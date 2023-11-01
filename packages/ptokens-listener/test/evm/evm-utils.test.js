const ethers = require('ethers')

describe('EVM utils', () => {
  describe('getEthersProvider', () => {
    beforeEach(() => {
      jest.restoreAllMocks()
    })

    it('Should get the correct provider', async () => {
      const { getEthersProvider } = require('../../lib/evm/evm-utils')
      const url = 'http://eth-node-1.ext.nu.p.network'

      const getDefaultProviderSpy = jest
        .spyOn(ethers.providers, 'JsonRpcProvider')
        .mockImplementation(() => {})

      const result = await getEthersProvider(url)

      expect(getDefaultProviderSpy).toHaveBeenCalledTimes(1)
      expect(getDefaultProviderSpy).toHaveBeenCalledWith(url)
      expect(result).toBeInstanceOf(ethers.providers.JsonRpcProvider)
    })
  })
})
