const { db } = require('ptokens-utils')
const reportsSet = require('./samples/detected-report-set')
const { filterForValidReports } = require('../lib/filter-for-valid-reports')

describe('Reports filtering tests', () => {
  const dbName = global.__MONGO_DB_NAME__
  const tableName = 'test'
  let collection = null
  const uri = global.__MONGO_URI__

  beforeAll(async () => {
    collection = await db.getCollection(uri, dbName, tableName)
  })

  afterAll(async () => {
    await db.closeConnection(uri)
  })

  describe('filterForValidReports', () => {
    beforeAll(async () => {
      await collection.deleteMany({})
      await db.insertReports(collection, reportsSet)
    })

    it('Should get an array with only valid reports', async () => {
      const result = await filterForValidReports(reportsSet)

      const expected = reportsSet
      expect(result).toStrictEqual(expected)
    })
  })
})
