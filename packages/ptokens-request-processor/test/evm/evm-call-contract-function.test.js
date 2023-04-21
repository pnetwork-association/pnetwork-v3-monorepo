const { jestMockContractConstructor } = require('./mock/jest-utils')

describe('General EVM contract function tests', () => {
  describe('callContractFunctionAndAwait', () => {
    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('Should call a contract function', async () => {
      const ethers = require('ethers')

      const expectedObject = {
        transactionHash: '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
      }

      const mockCallMint = jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue(expectedObject),
      })

      jest
        .spyOn(ethers, 'Contract')
        .mockImplementation(jestMockContractConstructor('mint', mockCallMint))

      const contract = new ethers.Contract()

      const { callContractFunctionAndAwait } = require('../../lib/evm/evm-call-contract-function')

      const result = await callContractFunctionAndAwait('mint', [], contract)

      expect(result).toStrictEqual(expectedObject)
    })
  })
})
