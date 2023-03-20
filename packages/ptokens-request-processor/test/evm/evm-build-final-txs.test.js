const schemas = require('ptokens-schemas')
const {
  jestMockEthers,
  jestMockContractConstructor,
} = require('./mock/jest-utils')

describe('General final txs testing', () => {
  describe('makeFinalContractCall', () => {
    it('Should create a callIssue final transaction', async () => {
      const ethers = jestMockEthers()
      const expectedObject = {
        transactionHash:
          '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
      }

      ethers.Contract = jestMockContractConstructor('callIssue', expectedObject)

      const {
        makeFinalContractCall,
      } = require('../../lib/evm/evm-build-final-txs')

      const wallet = ethers.Wallet.createRandom()
      const issuanceManagerAddress = ethers.Wallet.createRandom().address
      const redeemManagerAddress = ethers.Wallet.createRandom().address
      const eventReport = {
        [schemas.constants.SCHEMA_STATUS_KEY]: 'proposed',
        [schemas.constants.SCHEMA_AMOUNT_KEY]: '1111111',
        [schemas.constants.SCHEMA_EVENT_NAME_KEY]: 'pegin',
        [schemas.constants.SCHEMA_ORIGINATING_CHAIN_ID_KEY]: '0x005fe7f9',
        [schemas.constants.SCHEMA_DESTINATION_CHAIN_ID_KEY]: '0x01ec97de',
        [schemas.constants.SCHEMA_DESTINATION_ADDRESS_KEY]:
          '11eXzETyUxiQPXwU2udtVFQFrFjgRhhvPj',
        [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
          '0x9488dee8cb5c6b2f6299e45e48bba580f46dbd496cfaa70a182060fd5dc81cb4]',
        [schemas.constants.SCHEMA_TOKEN_ADDRESS_KEY]:
          '0xdaacb0ab6fb34d24e8a67bfa14bf4d95d4c7af92',
        [schemas.constants.SCHEMA_ORIGINATING_ADDRESS_KEY]:
          '0x9f5377fa03dcd4016a33669b385be4d0e02f27bc',
        [schemas.constants.SCHEMA_WITNESSED_TS_KEY]: '2023-03-07T16:11:38.835Z',
        [schemas.constants.SCHEMA_USER_DATA_KEY]: '0xC0FFEE',
        [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: '2023-03-07T17:00:50.835Z',
        [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]:
          '0xa7b6843d88aa6f5b43ddad7b84adf4c00689ecb752b7abd0e39304947b40863d',
        [schemas.constants.SCHEMA_FINAL_TX_HASH_KEY]: null,
        [schemas.constants.SCHEMA_FINAL_TX_TS_KEY]: null,
      }

      const result = await makeFinalContractCall(
        wallet,
        issuanceManagerAddress,
        redeemManagerAddress,
        eventReport
      )

      expect(result).toStrictEqual({
        transactionHash:
          '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
      })
    })
  })
})
