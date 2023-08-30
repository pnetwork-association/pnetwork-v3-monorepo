const { db } = require('ptokens-utils')
const constants = require('ptokens-constants')
const detectedEvents = require('./samples/detected-report-set').slice(0, 2)
const { STATE_DETECTED_DB_REPORTS } = require('../lib/state/constants')
const { getDetectedEventsFromDbAndPutInState } = require('../lib/get-events-from-db')

describe('General get events from db tests', () => {
  describe('getDetectedEventsFromDbAndPutInState', () => {
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

    it('Should get the detected events with the chain id 0x00e4b170', async () => {
      const networkId = '0xf9b459a1'
      const state = {
        [constants.state.KEY_DB]: collection,
        [constants.state.KEY_NETWORK_ID]: networkId,
      }

      const result = await getDetectedEventsFromDbAndPutInState(state)
      const expectedReports = [detectedEvents[0]]

      expect(result).toHaveProperty(constants.state.KEY_DB)
      expect(result).toHaveProperty(constants.state.KEY_NETWORK_ID)
      expect(result).toEqual(
        expect.objectContaining({
          [STATE_DETECTED_DB_REPORTS]: expectedReports,
        })
      )
    })
  })
})
