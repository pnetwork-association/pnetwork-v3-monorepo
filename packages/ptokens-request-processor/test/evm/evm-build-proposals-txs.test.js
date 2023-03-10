const ethers = require('ethers')
const schemas = require('ptokens-schemas')
const { validation } = require('ptokens-utils')

describe('Build proposals test for EVM', () => {
  describe('makeProposalContractCall', () => {
    it('Should mint a proposal as expected', async () => {
      const {
        makeProposalContractCall,
      } = require('../../lib/evm/evm-build-proposals-txs')
      const wallet = ethers.Wallet.createRandom()
      const issuanceManagerAddress = ethers.Wallet.createRandom().address
      const redeemManagerAddress = ethers.Wallet.createRandom().address
      // const providerUrl = 'http://localhost:8545'
      const eventReport = {
        amount: '1111111',
        destinationAddress: '11eXzETyUxiQPXwU2udtVFQFrFjgRhhvPj',
        destinationChainId: '0x01ec97de',
        eventName: 'redeem',
        originatingChainId: '0x005fe7f9',
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
        status: 'detected',
      }

      await validation.validateJson(schemas.db.collections.events, eventReport)

      const result = await makeProposalContractCall(
        wallet,
        issuanceManagerAddress,
        redeemManagerAddress,
        eventReport
      )

      // console.log(wallet.address)
      // console.log(result)

      expect(result).toStrictEqual({})
    })
  })
})
