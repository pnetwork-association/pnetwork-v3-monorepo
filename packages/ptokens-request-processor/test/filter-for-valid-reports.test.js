const { db } = require('ptokens-utils')
const reportsSet = require('./samples/reports-set')
const { filterForValidReports } = require('../lib/filter-for-valid-reports')

describe('Reports filtering tests', () => {
  const dbName = 'test'
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
      await db.insertReports(collection, reportsSet)
    })

    afterAll(async () => {
      await collection.deleteMany({})
    })

    it('Should get an array with only valid reports', async () => {
      const result = await filterForValidReports(reportsSet)

      const expected = reportsSet.splice(0, 4)
      expect(result).toHaveLength(4)
      expect(result).toStrictEqual(expected)
    })
  })
})
