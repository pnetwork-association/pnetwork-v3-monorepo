const { jestMockContractConstructor } = require('./mock/jest-utils')
const {
  STATE_DETECTED_DB_REPORTS_KEY,
  STATE_PROPOSED_DB_REPORTS_KEY,
} = require('../../lib/state/constants')
const schemas = require('ptokens-schemas')
const { logic, validation } = require('ptokens-utils')
const constants = require('ptokens-constants')
const detectedEvents = require('../samples/detected-report-set')
const {
  ETHERS_KEY_TX_HASH,
} = require('../../lib/evm/evm-call-contract-function')

describe('Build proposals test for EVM', () => {
  describe('makeProposalContractCall', () => {
    afterEach(() => {
      jest.restoreAllMocks()
      jest.resetModules()
    })

    const eventReport = detectedEvents[0]

    it('Should create a pegOut proposal as expected', async () => {
      const ethers = require('ethers')
      const proposedTxHash =
        '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf'
      const expectedObject = { [ETHERS_KEY_TX_HASH]: proposedTxHash }

      const mockQueueOperation = jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue(expectedObject),
      })

      jest
        .spyOn(ethers, 'Contract')
        .mockImplementation(
          jestMockContractConstructor(
            'protocolQueueOperation',
            mockQueueOperation
          )
        )

      const {
        makeProposalContractCall,
      } = require('../../lib/evm/evm-build-proposals-txs')

      const wallet = ethers.Wallet.createRandom()
      const stateManagerAddress = '0xC8E4270a6EF24B67eD38046318Fc8FC2d312f73C'

      await validation.validateJson(schemas.db.collections.events, eventReport)

      const txTimeout = 1000 //ms
      const result = await makeProposalContractCall(
        wallet,
        stateManagerAddress,
        txTimeout,
        eventReport
      )

      expect(result).toStrictEqual({
        ...eventReport,
        [schemas.constants.SCHEMA_STATUS_KEY]:
          schemas.db.enums.txStatus.PROPOSED,
        [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: proposedTxHash,
        [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: expect.any(String),
      })
    })

    it('Should handle the timeout error correctly', async () => {
      const ethers = require('ethers')

      const mockProtocolQueueOperation = jest.fn().mockResolvedValue({
        wait: jest
          .fn()
          .mockImplementation(() => logic.sleepForXMilliseconds(1000)),
      })

      jest
        .spyOn(ethers, 'Contract')
        .mockImplementation(
          jestMockContractConstructor(
            'protocolQueueOperation',
            mockProtocolQueueOperation
          )
        )

      const {
        makeProposalContractCall,
      } = require('../../lib/evm/evm-build-proposals-txs')

      const wallet = ethers.Wallet.createRandom()
      const stateManagerAddress = '0xC8E4270a6EF24B67eD38046318Fc8FC2d312f73C'

      await validation.validateJson(schemas.db.collections.events, eventReport)

      const txTimeout = 100 //ms
      const result = await makeProposalContractCall(
        wallet,
        stateManagerAddress,
        txTimeout,
        eventReport
      )
      expect(result).toStrictEqual(eventReport)
    })
  })

  describe('buildProposalsTxsAndPutInState', () => {
    const privKey =
      '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e'
    const gpgEncryptedFile = './identity.gpg'

    afterEach(async () => {
      jest.restoreAllMocks()
      jest.resetModules()
    })

    it('Should build the proposals and add them to the state', async () => {
      const ethers = require('ethers')
      const fs = require('fs/promises')

      jest.spyOn(fs, 'readFile').mockResolvedValue(privKey)
      jest.spyOn(ethers, 'JsonRpcProvider').mockResolvedValue({})
      jest.spyOn(ethers, 'Wallet').mockImplementation(_ => jest.fn())
      jest.spyOn(ethers, 'Contract').mockImplementation(_ => jest.fn())

      const proposedTxHashes = [
        '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
        '0x2c7e8870be7643d97699bbcf3396dfb13217ee54a6784abfcacdb1e077fe201f',
      ]

      const expecteCallResult = [
        {
          [ETHERS_KEY_TX_HASH]: proposedTxHashes[0],
        },
        {
          [ETHERS_KEY_TX_HASH]: proposedTxHashes[1],
        },
      ]

      const callContractFunctionModule = require('../../lib/evm/evm-call-contract-function')

      jest
        .spyOn(callContractFunctionModule, 'callContractFunctionAndAwait')
        .mockResolvedValueOnce(expecteCallResult[0])
        .mockResolvedValueOnce(expecteCallResult[1])

      const txTimeout = 1000
      const destinationNetworkId = '0xe15503e4'
      const providerUrl = 'http://localhost:8545'
      const stateManagerAddress = '0xC8E4270a6EF24B67eD38046318Fc8FC2d312f73C'

      const state = {
        [constants.state.STATE_KEY_TX_TIMEOUT]: txTimeout,
        [constants.state.STATE_KEY_PROVIDER_URL]: providerUrl,
        [constants.state.STATE_KEY_NETWORK_ID]: destinationNetworkId,
        [constants.state.STATE_KEY_IDENTITY_FILE]: gpgEncryptedFile,
        [constants.state.STATE_KEY_STATE_MANAGER_ADDRESS]: stateManagerAddress,
        [STATE_DETECTED_DB_REPORTS_KEY]: [detectedEvents[0], detectedEvents[1]],
      }

      const {
        buildProposalsTxsAndPutInState,
      } = require('../../lib/evm/evm-build-proposals-txs')

      const result = await buildProposalsTxsAndPutInState(state)

      expect(result).toHaveProperty(STATE_PROPOSED_DB_REPORTS_KEY)
      expect(result).toHaveProperty(STATE_DETECTED_DB_REPORTS_KEY)
      expect(result).toHaveProperty(constants.state.STATE_KEY_NETWORK_ID)
      expect(result).toHaveProperty(constants.state.STATE_KEY_PROVIDER_URL)
      expect(result).toHaveProperty(constants.state.STATE_KEY_IDENTITY_FILE)
      expect(result).toHaveProperty(
        constants.state.STATE_KEY_STATE_MANAGER_ADDRESS
      )
      expect(result).toHaveProperty(constants.state.STATE_KEY_TX_TIMEOUT)
      expect(result[STATE_PROPOSED_DB_REPORTS_KEY]).toHaveLength(2)

      expect(result[STATE_PROPOSED_DB_REPORTS_KEY][0]).toEqual(
        expect.objectContaining({
          [schemas.constants.SCHEMA_STATUS_KEY]:
            schemas.db.enums.txStatus.PROPOSED,
          [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: proposedTxHashes[0],
          [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: expect.any(String),
        })
      )

      expect(result[STATE_PROPOSED_DB_REPORTS_KEY][1]).toEqual(
        expect.objectContaining({
          [schemas.constants.SCHEMA_STATUS_KEY]:
            schemas.db.enums.txStatus.PROPOSED,
          [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: proposedTxHashes[1],
          [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: expect.any(String),
        })
      )
    })
  })
})
