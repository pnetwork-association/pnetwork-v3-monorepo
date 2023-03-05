const rewire = require('rewire')
const assert = require('assert')
const { MongoMemoryServer } = require('mongodb-memory-server')

describe('Database interface tests', () => {
  let mongod
  const DATABASE_NAME = 'test'
  const COLLECTION_NAME = 'test'

  const DUMMY_REPORTS_SET_1 = [
    { _id: 'report-1', data: 'fox' },
    { _id: 'report-2', data: 'whale' },
    { _id: 'report-3', data: 'dog' },
    { _id: 'report-4', data: 'fox' },
    { _id: 'report-5', data: 'santa' },
    { _id: 'report-6', data: 'crazy' },
    { _id: 'report-7', data: 'fog' },
    { _id: 'report-8', data: 'whale' },
  ]

  const insertReportsSet = (_lib, _collection, _reportsSet) =>
    Promise.all(_reportsSet.map(_lib.insertReport(_collection)))

  const deleteReportsSet = (_lib, _collection, _reportsSet) =>
    Promise.all(
      _reportsSet.map(_report => _lib.deleteReport(_collection, _report._id))
    )

  before(async () => {
    mongod = await MongoMemoryServer.create()
  })

  after(async () => {
    const { db } = require('../..')

    db.closeConnection(mongod.getUri())

    await mongod.stop()
  })

  describe('getClient', () => {
    it('Should reject with timeout error when trying to get the Mongo instance', async () => {
      const { db } = require('../..')
      const url = 'mongodb://127.0.0.1:65000/test'
      try {
        await db.getClient(url)
        assert.fail('Should never reach here')
      } catch (err) {
        assert(err.message.includes('ECONNREFUSED'))
      }
    })

    it('Should connect to the db instance successfully', async () => {
      const { MongoClient } = require('mongodb')
      const { db } = require('../..')

      const client = await db.getClient(mongod.getUri())

      assert(client instanceof MongoClient)
    })

    it('Should reject upon connection error', async () => {
      const db = rewire('../../lib/db/db-interface')
      const error = 'Connection failure'

      db.__set__('createConnection', () => Promise.reject(new Error(error)))

      try {
        await db.getClient(mongod.getUri())
        assert.fail()
      } catch (err) {
        assert(err.message.includes(error))
      }
    })
  })

  describe('insertReport', () => {
    const { db } = require('../..')
    let collection

    before(async () => {
      collection = await db.getCollection(
        mongod.getUri(),
        DATABASE_NAME,
        COLLECTION_NAME
      )
    })

    it('Should insert a report successfully', async () => {
      const dummyReport = { _id: 123, key1: 'Hello', key2: 'World' }
      const result = await db.insertReport(collection, dummyReport)

      assert.equal(result, dummyReport)
    })

    it('Should reject upon report with the same id insertion', async () => {
      const dummyReport = { _id: 123, key1: 'Hello', key2: 'World' }

      try {
        // Standalone not working, needs previous test
        await db.insertReport(collection, dummyReport)
        assert.fail()
      } catch (err) {
        assert(err.message.includes('duplicate key error'))
      }
    })
  })

  describe('updateReport', () => {
    let collection
    const { db } = require('../..')

    before(async () => {
      collection = await db.getCollection(
        mongod.getUri(),
        DATABASE_NAME,
        COLLECTION_NAME
      )
    })

    it('Should update a report successfully', async () => {
      const reportId = 123

      const result = await db.updateReport(
        collection,
        { $set: { key1: 'Ciao' } },
        reportId
      )

      assert.equal(result, reportId)
    })
  })

  describe('deleteReport', () => {
    let collection
    const { db } = require('../..')
    before(async () => {
      collection = await db.getCollection(
        mongod.getUri(),
        DATABASE_NAME,
        COLLECTION_NAME
      )
    })

    it('Should delete a report successfully', async () => {
      const reportId = 123

      const result = await db.deleteReport(collection, reportId)

      assert.equal(result, reportId)
    })
  })

  describe('deleteReportByQuery', () => {
    let collection
    const reports = [
      { _id: 'xyz', hello: 'world' },
      { _id: 'abc', ciao: 'mondo' },
    ]
    const { db } = require('../..')
    before(async () => {
      collection = await db.getCollection(
        mongod.getUri(),
        DATABASE_NAME,
        COLLECTION_NAME
      )
    })

    after(async () => {
      await Promise.all(
        reports.map(_report => db.deleteReport(collection, _report))
      )
    })

    it('Should delete a report by a custom query', async () => {
      await db.insertReports(collection, reports)

      await db.deleteReportByQuery(collection, { ciao: 'mondo' })

      const results = await db.findReports(collection, {})

      assert.equal(results.length, 1)
      assert.deepStrictEqual(results, [reports[0]])
    })
  })

  describe('findReportById', () => {
    const { db } = require('../..')
    let collection

    before(async () => {
      collection = await db.getCollection(
        mongod.getUri(),
        DATABASE_NAME,
        COLLECTION_NAME
      )
    })

    it('Should return the report with the correct id', async () => {
      for (let i = 0; i < 20; i++) {
        const report = { _id: i, data: `data ${i}` }
        await db.insertReport(collection, report)
      }

      const result = await db.findReportById(collection, 15)
      const expected = { _id: 15, data: 'data 15' }

      assert.deepEqual(result, expected)
    })

    it('Should return null if no report is found', async () => {
      const result = await db.findReportById(collection, 21)
      const expected = null

      assert.deepEqual(result, expected)
    })
  })

  describe('findReports', () => {
    const { db } = require('../..')
    const reports = DUMMY_REPORTS_SET_1

    let collection

    before(async () => {
      collection = await db.getCollection(
        mongod.getUri(),
        DATABASE_NAME,
        COLLECTION_NAME
      )
      await insertReportsSet(db, collection, reports)
    })

    after(async () => {
      await deleteReportsSet(db, collection, reports)
    })

    it('Should return a subset of reports satisfying the condition', async () => {
      const expected = reports.filter(x => x.data === 'fox')
      const query = { data: { $eq: 'fox' } }
      const result = await db.findReports(collection, query)

      assert.deepEqual(result, expected)
    })

    it('Should return an empty array if no reports are found', async () => {
      const result = await db.findReports(collection, {
        data: { $eq: 'something' },
      })
      const expected = []

      assert.deepEqual(result, expected)
    })
  })

  describe('editReportField', () => {
    const { db } = require('../..')
    const reports = DUMMY_REPORTS_SET_1
    let collection

    before(async () => {
      collection = await db.getCollection(
        mongod.getUri(),
        DATABASE_NAME,
        COLLECTION_NAME
      )
    })

    before(async () => {
      await insertReportsSet(db, collection, reports)
    })

    after(async () => {
      await deleteReportsSet(db, collection, reports)
    })

    it('Should edit a report field successfully', async () => {
      const field = 'data'
      const value = 'edited!'
      const id = reports[7]['_id']
      const expected = { _id: id, data: 'edited!' }

      const result = await db.editReportField(collection, field, value, id)
      const report = await db.findReportById(collection, id)

      assert.deepStrictEqual(result, id)
      assert.deepStrictEqual(report, expected)
    })

    it('Should add the property when it does not exist', async () => {
      const field = 'notexist'
      const value = 'edited!'
      const id = reports[6]['_id']
      const expected = {
        ...reports[6],
        notexist: value,
      }

      const result = await db.editReportField(collection, field, value, id)
      const report = await db.findReportById(collection, id)

      assert.deepStrictEqual(result, id)
      assert.deepStrictEqual(report, expected)
    })
  })

  describe('renameField', () => {
    const { db } = require('../..')
    let id = null
    let report = null
    let collection

    before(async () => {
      collection = await db.getCollection(
        mongod.getUri(),
        DATABASE_NAME,
        COLLECTION_NAME
      )
      report = await db.insertReport(collection, DUMMY_REPORTS_SET_1[0])
      id = report['_id']
    })

    after(async () => {
      await db.deleteReport(collection, id)
    })

    it('Should rename a report field', async () => {
      const actualName = 'data'
      const newName = 'newdata'

      await db.renameField(collection, actualName, newName, id)

      const newReport = await db.findReportById(collection, id)
      const expected = {
        _id: DUMMY_REPORTS_SET_1[0]['_id'],
        newdata: DUMMY_REPORTS_SET_1[0]['data'],
      }

      assert.deepStrictEqual(newReport, expected)
    })
  })

  describe('renameReportsField', () => {
    const { db } = require('../..')
    const reports = DUMMY_REPORTS_SET_1
    let collection

    before(async () => {
      collection = await db.getCollection(
        mongod.getUri(),
        DATABASE_NAME,
        COLLECTION_NAME
      )
      await insertReportsSet(db, collection, reports)
    })

    after(async () => {
      await deleteReportsSet(db, collection, reports)
    })

    it('Should rename each field successfully', async () => {
      const actualName = 'data'
      const newName = 'newdata'

      await db.renameReportsField(collection, actualName, newName, /report-/)
      const actualReports = await db.findReports(collection, { _id: /report/ })

      const expected = DUMMY_REPORTS_SET_1.map(_report => {
        const value = _report[actualName]
        delete _report[actualName]
        _report[newName] = value
        return _report
      })

      assert.deepStrictEqual(actualReports, expected)
    })
  })
})

describe('Connection teardown test', () => {
  describe('closeConnection', () => {
    it('Should close the db connection successfully', async () => {
      const mongod = await MongoMemoryServer.create()

      const { db } = require('../..')

      try {
        await db.closeConnection(mongod.getUri())
        await mongod.stop()
      } catch (err) {
        assert.fail()
      }
    })
  })
})
