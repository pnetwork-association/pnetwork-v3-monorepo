const { db } = require('ptokens-utils')
const constants = require('ptokens-constants')

const detectedEvents = require('./samples/detected-report-set')
const { STATE_PROPOSED_DB_REPORTS } = require('../lib/state/constants')
const { maybeUpdateProposedEventsInDb } = require('../lib/update-events-in-db')

describe('General events report update tests', () => {
  let collection = null
  const uri = global.__MONGO_URI__
  const dbName = global.__MONGO_DB_NAME__
  const table = 'test'

  beforeAll(async () => {
    collection = await db.getCollection(uri, dbName, table)
  })

  beforeEach(async () => {
    await collection.deleteMany({})
    await collection.insertMany(detectedEvents)
  })

  afterAll(async () => {
    await db.closeConnection(uri)
  })

  describe('maybeUpdateProposedEventsInDb', () => {
    it('Should update the proposed events in the db as expected', async () => {
      const proposedTxHashes = [
        '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
        '0x2c7e8870be7643d97699bbcf3396dfb13217ee54a6784abfcacdb1e077fe201f',
      ]
      const proposedTimestamps = [new Date().toISOString(), new Date().toISOString()]
      const state = {
        [constants.state.KEY_DB]: collection,
        [STATE_PROPOSED_DB_REPORTS]: [
          {
            ...detectedEvents[0],
            [constants.db.KEY_PROPOSAL_TS]: proposedTimestamps[0],
            [constants.db.KEY_PROPOSAL_TX_HASH]: proposedTxHashes[0],
            [constants.db.KEY_STATUS]: constants.db.txStatus.PROPOSED,
          },
          {
            ...detectedEvents[1],
            [constants.db.KEY_PROPOSAL_TS]: proposedTimestamps[1],
            [constants.db.KEY_PROPOSAL_TX_HASH]: proposedTxHashes[1],
            [constants.db.KEY_STATUS]: constants.db.txStatus.PROPOSED,
          },
        ],
      }

      const result = await maybeUpdateProposedEventsInDb(state)

      expect(result).toHaveProperty(constants.state.KEY_DB)
      expect(result).toHaveProperty(STATE_PROPOSED_DB_REPORTS)

      const query = {
        [constants.db.KEY_STATUS]: constants.db.txStatus.PROPOSED,
      }

      const updatedReports = await db.findReports(collection, query)

      expect(updatedReports).toHaveLength(2)
    })
  })
})
