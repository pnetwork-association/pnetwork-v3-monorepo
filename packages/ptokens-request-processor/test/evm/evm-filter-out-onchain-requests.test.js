const ethers = require('ethers')
const { db } = require('ptokens-utils')
const constants = require('ptokens-constants')
const { jestMockContractConstructor } = require('./mock/jest-utils')
const { STATE_DETECTED_DB_REPORTS } = require('../../lib/state/constants')
const detectedEvents = require('../samples/detected-report-set').slice(0, 2)

describe('Tests for already processed requests filtering', () => {
  describe('filterOutAlreadyProcessedRequests', () => {
    let collection = null
    const uri = global.__MONGO_URI__
    const dbName = global.__MONGO_DB_NAME__
    const table = 'test'

    beforeAll(async () => {
      collection = await db.getCollection(uri, dbName, table)
    })

    beforeEach(async () => {
      jest.resetAllMocks()
      await collection.deleteMany({})
      await collection.insertMany(detectedEvents)
    })

    afterAll(async () => {
      await db.closeConnection(uri)
    })

    it('Should update the onchain requests w/ the correct status', async () => {
      const mockOperationStatusOf = jest
        .fn()
        .mockResolvedValueOnce('0x01')
        .mockResolvedValueOnce('0x02')

      jest
        .spyOn(ethers, 'Contract')
        .mockImplementation(jestMockContractConstructor('operationStatusOf', mockOperationStatusOf))

      const state = {
        [constants.state.KEY_DB]: collection,
        [STATE_DETECTED_DB_REPORTS]: detectedEvents,
        [constants.state.KEY_NETWORK_ID]: '0xf9b459a1',
        [constants.state.KEY_PROVIDER_URL]: 'http://localhost:8545',
        [constants.state.KEY_HUB_ADDRESS]: '0xC8E4270a6EF24B67eD38046318Fc8FC2d312f73C',
      }

      const {
        filterOutDetectedEventsWithWrongStatusAndPutInState,
      } = require('../../lib/evm/evm-filter-out-onchain-requests')

      const result = await filterOutDetectedEventsWithWrongStatusAndPutInState(state)

      const proposedEvents = await db.findReports(collection, {
        [constants.db.KEY_STATUS]: constants.db.txStatus.PROPOSED,
      })

      const finalizedEvents = await db.findReports(collection, {
        [constants.db.KEY_STATUS]: constants.db.txStatus.FINALIZED,
      })

      expect(result).toHaveProperty(STATE_DETECTED_DB_REPORTS)
      expect(result[STATE_DETECTED_DB_REPORTS]).toHaveLength(0)
      expect(proposedEvents).toHaveLength(1)
      expect(finalizedEvents).toHaveLength(1)
    })
  })
})
