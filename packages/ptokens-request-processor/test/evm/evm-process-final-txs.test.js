const fs = require('fs/promises')
const {
  jestMockEthers,
  jestMockContractConstructor,
} = require('./mock/jest-utils')
const {
  STATE_ONCHAIN_REQUESTS_KEY,
  STATE_DETECTED_DB_REPORTS_KEY,
  STATE_PROPOSED_DB_REPORTS_KEY,
  STATE_FINALIZED_DB_REPORTS_KEY,
} = require('../../lib/state/constants')
const { prop } = require('ramda')
const { db } = require('ptokens-utils')
const constants = require('ptokens-constants')
const schemas = require('ptokens-schemas')
const proposedEvents = require('../samples/proposed-report-set')

describe('Main EVM flow for transaction proposal tests', () => {
  describe('maybeProcessFinalTransactions', () => {
    let collection = null
    const uri = global.__MONGO_URI__
    const dbName = global.__MONGO_DB_NAME__
    const table = 'test'
    const gpgEncryptedFile = './identity.gpg'
    const privKey =
      '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e'

    beforeAll(async () => {
      collection = await db.getCollection(uri, dbName, table)
      await fs.writeFile(gpgEncryptedFile, privKey)
    })

    beforeEach(async () => {
      await collection.insertMany(proposedEvents)
    })

    afterEach(async () => {
      await Promise.all(proposedEvents.map(prop('_id'))).then(_ids =>
        Promise.all(_ids.map(db.deleteReport(collection)))
      )

      await jest.restoreAllMocks()
    })

    afterAll(async () => {
      await db.closeConnection(uri)
    })

    it('Should finalize proposed events which challenge period has expired', async () => {
      const ethers = jestMockEthers()
      const finalizedTxHashes = [
        '0x3319a74fd2e369da02c230818d5196682daaf86d213ce5257766858558ee5462',
        '0x5639789165d988f45f55bc8fcfc5bb24a6000b2669d0d2f1524f693ce3e4588f',
      ]
      const expecteCallResults = [
        {
          transactionHash: finalizedTxHashes[0],
        },
        {
          transactionHash: finalizedTxHashes[1],
        },
      ]

      const mockCallIssue = jest.fn().mockResolvedValue({
        wait: jest
          .fn()
          .mockResolvedValueOnce(expecteCallResults[0])
          .mockResolvedValueOnce(expecteCallResults[1]),
      })

      ethers.Contract = jestMockContractConstructor('callRedeem', mockCallIssue)

      const state = {
        [constants.state.STATE_KEY_DB]: collection,
        [constants.state.STATE_KEY_CHALLENGE_PERIOD]: 20,
        [constants.state.STATE_KEY_CHAIN_ID]: '0x01ec97de',
        [constants.state.STATE_KEY_ISSUANCE_MANAGER_ADDRESS]:
          '0x73c47d9Da343328Aa744E712560D91C6de9084a0',
        [constants.state.STATE_KEY_STATE_MANAGER_ADDRESS]:
          '0x73c47d9Da343328Aa744E712560D91C6de9084a0',
        [constants.state.STATE_KEY_IDENTITY_FILE]: gpgEncryptedFile,
      }

      const {
        maybeProcessFinalTransactions,
      } = require('../../lib/evm/evm-process-final-txs')

      const result = await maybeProcessFinalTransactions(state)

      expect(result).toHaveProperty(constants.state.STATE_KEY_DB)
      expect(result).not.toHaveProperty(STATE_ONCHAIN_REQUESTS_KEY)
      expect(result).not.toHaveProperty(STATE_DETECTED_DB_REPORTS_KEY)
      expect(result).not.toHaveProperty(STATE_PROPOSED_DB_REPORTS_KEY)
      expect(result).not.toHaveProperty(STATE_FINALIZED_DB_REPORTS_KEY)
      expect(result).toHaveProperty(constants.state.STATE_KEY_IDENTITY_FILE)

      const finalizedEvents = await db.findReports(collection, {
        [schemas.constants.SCHEMA_STATUS_KEY]:
          schemas.db.enums.txStatus.FINALIZED,
      })

      expect(finalizedEvents).toHaveLength(2)
    })
  })
})
