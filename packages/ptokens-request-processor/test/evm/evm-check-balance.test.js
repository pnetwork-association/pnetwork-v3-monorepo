const ethers = require('ethers')
const constants = require('ptokens-constants')
const { utils } = require('ptokens-utils')

describe('Tests for the balance check', () => {
  // Hardhat address
  // secretlint-disable-next-line
  const privKey = '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e'
  const address = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'
  const balance = BigInt('2000000000000000000') // 2e18
  const balanceThreshold = '1' // 1e18

  describe('checkBalance', () => {
    beforeEach(async () => {
      jest.restoreAllMocks()
    })

    it('Should return the state object when the balance is over the set threshold', async () => {
      jest.spyOn(utils, 'readIdentityFileSync').mockReturnValue(privKey)

      const mockGetBalance = jest.fn().mockResolvedValue(balance)

      jest
        .spyOn(ethers, 'JsonRpcProvider')
        .mockImplementation(_ => ({ getBalance: mockGetBalance }))

      const { checkBalance } = require('../../lib/evm/evm-check-balance')
      const state = {
        [constants.state.KEY_PROVIDER_URL]: 'provider-url',
        [constants.state.KEY_IDENTITY_FILE]: 'identity-file',
        [constants.state.KEY_BALANCE_THRESHOLD]: balanceThreshold,
      }

      expect(checkBalance(state)).resolves.toBe(state)
    })

    it('Should throw when the balance is under the set threshold', async () => {
      const errors = require('../../lib/errors')

      const zeroBalance = BigInt(0)

      jest.spyOn(utils, 'readIdentityFileSync').mockReturnValue(privKey)

      const mockGetBalance = jest.fn().mockResolvedValue(zeroBalance)

      jest
        .spyOn(ethers, 'JsonRpcProvider')
        .mockImplementation(_ => ({ getBalance: mockGetBalance }))

      const { checkBalance } = require('../../lib/evm/evm-check-balance')
      const state = {
        [constants.state.KEY_PROVIDER_URL]: 'provider-url',
        [constants.state.KEY_IDENTITY_FILE]: 'identity-file',
        [constants.state.KEY_BALANCE_THRESHOLD]: balanceThreshold,
      }

      expect(checkBalance(state)).rejects.toThrow(
        `${errors.ERROR_INSUFFICIENT_FUNDS}: ${address}, ${zeroBalance} < ${ethers.parseEther(
          balanceThreshold
        )}`
      )
    })
  })
})
