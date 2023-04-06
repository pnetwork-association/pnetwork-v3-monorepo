const fs = require('fs')
const {
  jestMockEthers,
  jestMockContractConstructor,
} = require('./mock/jest-utils')
const { prop } = require('ramda')
const { db } = require('ptokens-utils')
const schemas = require('ptokens-schemas')
const constants = require('ptokens-constants')
const {
  STATE_ONCHAIN_REQUESTS_KEY,
  STATE_DETECTED_DB_REPORTS_KEY,
  STATE_PROPOSED_DB_REPORTS_KEY,
} = require('../../lib/state/constants')
const detectedEvents = require('../samples/detected-report-set').slice(0, 2)

describe('Main EVM flow for transaction proposal tests', () => {
  describe('maybeProcessNewRequestsAndPropose', () => {
    let collection = null
    const uri = global.__MONGO_URI__
    const dbName = global.__MONGO_DB_NAME__
    const table = 'test'
    const gpgEncryptedFile = './identity.gpg'
    const privKey =
      '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e'

    beforeAll(async () => {
      collection = await db.getCollection(uri, dbName, table)
      fs.writeFileSync(gpgEncryptedFile, privKey)
    })

    beforeEach(async () => {
      await collection.insertMany(detectedEvents)
    })

    afterEach(async () => {
      await Promise.all(detectedEvents.map(prop('_id'))).then(_ids =>
        Promise.all(_ids.map(db.deleteReport(collection)))
      )
    })

    afterAll(async () => {
      await db.closeConnection(uri)
      fs.rmSync(gpgEncryptedFile)
    })

    it('Should detect the new events and build the proposals', async () => {
      const ethers = jestMockEthers()
      const proposedTxHashes = [
        '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
        '0x2c7e8870be7643d97699bbcf3396dfb13217ee54a6784abfcacdb1e077fe201f',
      ]
      const expecteCallResult = [
        {
          hash: proposedTxHashes[0],
        },
        {
          hash: proposedTxHashes[1],
        },
      ]
      const mockQueueOperation = jest.fn().mockResolvedValue({
        wait: jest
          .fn()
          .mockResolvedValueOnce(expecteCallResult[0])
          .mockResolvedValueOnce(expecteCallResult[1]),
      })

      ethers.Contract = jestMockContractConstructor(
        'protocolQueueOperation',
        mockQueueOperation
      )

      const state = {
        [constants.state.STATE_KEY_DB]: collection,
        [constants.state.STATE_KEY_LOOP_SLEEP_TIME]: 1,
        [constants.state.STATE_KEY_IDENTITY_FILE]: gpgEncryptedFile,
        [constants.state.STATE_KEY_CHAIN_ID]: '0xe15503e4',
      }
      const {
        maybeProcessNewRequestsAndPropose,
      } = require('../../lib/evm/evm-process-proposal-txs')
      const result = await maybeProcessNewRequestsAndPropose(state)

      expect(result).toHaveProperty(constants.state.STATE_KEY_DB)
      expect(result).not.toHaveProperty(STATE_ONCHAIN_REQUESTS_KEY)
      expect(result).not.toHaveProperty(STATE_DETECTED_DB_REPORTS_KEY)
      expect(result).not.toHaveProperty(STATE_PROPOSED_DB_REPORTS_KEY)
      expect(result).toHaveProperty(constants.state.STATE_KEY_IDENTITY_FILE)

      const proposedEvents = await db.findReports(collection, {
        [schemas.constants.SCHEMA_STATUS_KEY]:
          schemas.db.enums.txStatus.PROPOSED,
      })

      expect(proposedEvents).toHaveLength(2)
    })
  })
})
