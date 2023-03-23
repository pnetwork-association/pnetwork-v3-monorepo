const { prop } = require('ramda')
const { MongoClient } = require('mongodb')
const { constants, db } = require('ptokens-utils')
const schemas = require('ptokens-schemas')
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
        [constants.STATE_KEY_DB]: collection,
        [schemas.constants.SCHEMA_CHAIN_ID_KEY]: '0x01ec97de',
      }

      const result = await getDetectedEventsFromDbAndPutInState(state)
      const expectedReports = [detectedEvents[0], detectedEvents[1]]

      expect(result).toHaveProperty(constants.STATE_KEY_DB)
      expect(result).toHaveProperty(schemas.constants.SCHEMA_CHAIN_ID_KEY)
      expect(result).toEqual(
        expect.objectContaining({
          [STATE_DETECTED_DB_REPORTS_KEY]: expectedReports,
        })
      )
    })
  })
})
