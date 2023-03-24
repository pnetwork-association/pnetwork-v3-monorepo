const { prop } = require('ramda')
const { MongoClient } = require('mongodb')
const constants = require('ptokens-constants')
const { db } = require('ptokens-utils')
const detectedEvents = require('./samples/detected-report-set')
const { STATE_DETECTED_DB_REPORTS_KEY } = require('../lib/state/constants')
const {
  getDetectedEventsFromDbAndPutInState,
} = require('../lib/get-events-from-db')

describe('General get events from db tests', () => {
  describe('getDetectedEventsFromDbAndPutInState', () => {
    let database = null
    let connection = null
    let collection = null

    beforeAll(async () => {
      connection = await MongoClient.connect(global.__MONGO_URI__, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })

      database = await connection.db('test')
      collection = await database.collection('test')
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
      await connection.close()
    })

    it('Should get the detected events with the chain id 0x00e4b170', async () => {
      const state = {
        [constants.state.STATE_KEY_DB]: collection,
        [constants.state.STATE_KEY_CHAIN_ID]: '0x01ec97de',
      }

      const result = await getDetectedEventsFromDbAndPutInState(state)
      const expectedReports = [detectedEvents[0], detectedEvents[1]]

      expect(result).toHaveProperty(constants.state.STATE_KEY_DB)
      expect(result).toHaveProperty(constants.state.STATE_KEY_CHAIN_ID)
      expect(result).toEqual(
        expect.objectContaining({
          [STATE_DETECTED_DB_REPORTS_KEY]: expectedReports,
        })
      )
    })
  })
})
