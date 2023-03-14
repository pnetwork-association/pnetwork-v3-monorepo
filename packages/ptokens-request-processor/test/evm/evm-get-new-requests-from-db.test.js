const { db } = require('ptokens-utils')
const reportsSet = require('../samples/reports-set')

describe('EVM Get new requests from db tests', () => {
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
    const {
      filterForValidReports,
    } = require('../../lib/evm/evm-get-detected-events-from-db')

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
