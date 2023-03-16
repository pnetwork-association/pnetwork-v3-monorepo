const {
  jestMockEthers,
  jestMockContractConstructor,
} = require('./mock/jest-utils')
const schemas = require('ptokens-schemas')
const { validation } = require('ptokens-utils')

describe('Build proposals test for EVM', () => {
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
        [schemas.constants.SCHEMA_STATUS_KEY]: 'detected',
        [schemas.constants.SCHEMA_AMOUNT_KEY]: '1111111',
        [schemas.constants.SCHEMA_EVENT_NAME_KEY]: 'redeem',
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
        [schemas.constants.SCHEMA_USER_DATA_KEY]: null,
        [schemas.constants.SCHEMA_FINAL_TX_HASH_KEY]: null,
        [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: null,
        [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
        [schemas.constants.SCHEMA_FINAL_TX_TS_KEY]: null,
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

    it('Should handle the timeout error correctly', async () => {
      const ethers = jestMockEthers()
      const expectedObject = {
        transactionHash:
          '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
      }

      ethers.Contract = jestMockContractConstructor(
        'pegOut',
        expectedObject,
        201
      )

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
        'tx-timeout': 200,
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

      expect(result).toStrictEqual(undefined)
    })
  })
})
