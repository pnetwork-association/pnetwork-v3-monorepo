const schemas = require('ptokens-schemas')
const { validation } = require('ptokens-utils')

describe('Build proposals test for EVM', () => {
  const jestMockEthers = () => {
    jest.mock('ethers', () => ({
      __esModule: true,
      ...jest.requireActual('ethers'),
    }))

    return require('ethers')
  }

  const jestMockContractConstructor = (_fxnName, _resolvedValue) => {
    // No arrow function here: doesn't work with
    // constructors
    return function () {
      return {
        [_fxnName]: jest.fn().mockResolvedValue({
          wait: jest.fn().mockResolvedValue(_resolvedValue),
        }),
      }
    }
  }

  describe('callContractFunctionAndAwait', () => {
    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('Should call a contract function', async () => {
      const ethers = jestMockEthers()

      const expectedObject = {
        transactionHash:
          '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
      }

      ethers.Contract = jestMockContractConstructor('mint', expectedObject)

      const contract = new ethers.Contract()

      const {
        callContractFunctionAndAwait,
      } = require('../../lib/evm/evm-build-proposals-txs')

      const result = await callContractFunctionAndAwait('mint', [], contract)

      expect(result).toStrictEqual(expectedObject)
    })
  })

  describe('makeProposalContractCall', () => {
    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('Should create a pegOut proposal as expected', async () => {
      const ethers = jestMockEthers()
      const expectedObject = {
        transactionHash:
          '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
      }

      ethers.Contract = jestMockContractConstructor('pegOut', expectedObject)

      const {
        makeProposalContractCall,
      } = require('../../lib/evm/evm-build-proposals-txs')

      const wallet = ethers.Wallet.createRandom()
      const issuanceManagerAddress = ethers.Wallet.createRandom().address
      const redeemManagerAddress = ethers.Wallet.createRandom().address
      const eventReport = {
        status: 'detected',
        amount: '1111111',
        eventName: 'redeem',
        originatingChainId: '0x005fe7f9',
        destinationChainId: '0x01ec97de',
        destinationAddress: '11eXzETyUxiQPXwU2udtVFQFrFjgRhhvPj',
        originatingTransactionHash:
          '0x9488dee8cb5c6b2f6299e45e48bba580f46dbd496cfaa70a182060fd5dc81cb4',
        tokenAddress: '0xdaacb0ab6fb34d24e8a67bfa14bf4d95d4c7af92',
        originatingAddress: '0x9f5377fa03dcd4016a33669b385be4d0e02f27bc',
        witnessedTimestamp: '2023-03-07T16:11:38.835Z',
        userData: null,
        finalTransactionHash: null,
        proposedTransactionHash: null,
        proposedTransactionTimestamp: null,
        finalTransactionTimestamp: null,
      }

      await validation.validateJson(schemas.db.collections.events, eventReport)

      const result = await makeProposalContractCall(
        wallet,
        issuanceManagerAddress,
        redeemManagerAddress,
        eventReport
      )

      expect(result).toStrictEqual(expectedObject)
    })
  })
})
