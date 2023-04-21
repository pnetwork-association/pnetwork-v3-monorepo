const assert = require('assert')
const { db } = require('../..')
const fullDbSample1 = require('./res/01-full-db-sample')
const { MongoMemoryServer } = require('mongodb-memory-server')

describe('High level DB function general testing', () => {
  let mongod, reportsCollection, depositAddressesCollection
  const legacy = false
  const bridgeType = 'pbtc-on-int'
  const databaseName = 'test'
  const reportsCollectionName = 'reports'
  const depositAddressesCollectionName = 'deposit_addresses'

  before(async () => {
    mongod = await MongoMemoryServer.create()
    reportsCollection = await db.getCollection(mongod.getUri(), databaseName, reportsCollectionName)
    depositAddressesCollection = await db.getCollection(
      mongod.getUri(),
      databaseName,
      depositAddressesCollectionName
    )

    await db.insertReports(reportsCollection, fullDbSample1.reports)
    await db.insertReports(depositAddressesCollection, fullDbSample1.depositAddresses)
  })

  after(async () => {
    db.closeConnection(mongod.getUri())
    await mongod.stop()
  })

  describe('deleteReportWithNonce', () => {
    it('Should delete a HOST report successfully', async () => {
      const expectedReportId = 'pbtc-on-int-int-0'
      const shouldFindAReport = await db.findReportById(reportsCollection, expectedReportId)

      assert.ok(shouldFindAReport)
      assert.deepStrictEqual(shouldFindAReport._id, expectedReportId)

      await db.deleteHostReport(bridgeType, legacy, reportsCollection, 0)

      const shoudlNotFindAReport = await db.findReportById(reportsCollection, expectedReportId)

      assert.deepStrictEqual(shoudlNotFindAReport, null)
    })

    it('Should delete a NATIVE report successfully', async () => {
      const expectedReportId = 'pbtc-on-int-btc-3'
      const shouldFindAReport = await db.findReportById(reportsCollection, expectedReportId)

      assert.ok(shouldFindAReport)
      assert.deepStrictEqual(shouldFindAReport._id, expectedReportId)

      await db.deleteNativeReport(bridgeType, legacy, reportsCollection, 3)

      const shouldNotFindTheReport = await db.findReportById(reportsCollection, expectedReportId)

      assert.deepStrictEqual(shouldNotFindTheReport, null)
    })
  })

  describe('getLastNonce', () => {
    it('Should find the NATIVE nonce successfully', async () => {
      const nonceObject = await db.getLastNativeNonce(bridgeType, reportsCollection)

      assert.deepStrictEqual(nonceObject, 12)
    })

    it('Should find the HOST nonce successfully', async () => {
      const nonceObject = await db.getLastHostNonce(bridgeType, reportsCollection)

      assert.deepStrictEqual(nonceObject, 24)
    })
  })

  describe('getLastProcessedBlock', () => {
    it('Should get the latest processed NATIVE block successfully', async () => {
      const lastProcessedBlock = await db.getLastProcessedNativeBlock(bridgeType, reportsCollection)

      assert.deepStrictEqual(lastProcessedBlock, 2286574)
    })

    it('Should get the latest processed HOST block successfully', async () => {
      const lastProcessedBlock = await db.getLastProcessedHostBlock(bridgeType, reportsCollection)

      assert.deepStrictEqual(lastProcessedBlock, 210123)
    })
  })

  describe('getLegacyDepositAddressArray', () => {
    it('Should get the legacy deposit address array successfully', async () => {
      const legacyDepositAddressArray = await db.getLegacyDepositAddressArray(
        reportsCollection,
        db.REPORT_ID_TESTNET_DEPOSIT_ADDRESS_ARRAY
      )

      assert.deepStrictEqual(legacyDepositAddressArray.length, 17)
    })
  })

  describe('getAllDepositAddresses', () => {
    it('Should get deposit addresses, legacy and collection based', async () => {
      const legacyDepositAddressArray = await db.getAllDepositAddresses(
        reportsCollection,
        depositAddressesCollection,
        db.REPORT_ID_TESTNET_DEPOSIT_ADDRESS_ARRAY
      )

      assert.deepStrictEqual(legacyDepositAddressArray.length, 101)
    })
  })

  describe('setLastNonce', () => {
    it('Should set the last NATIVE nonce successfully', async () => {
      const valueBeforeEdit = await db.getLastNativeNonce(bridgeType, reportsCollection)
      const expectedValue = valueBeforeEdit + 1
      await db.setLastNativeNonce(bridgeType, reportsCollection, expectedValue)
      const valueAfterEdit = await db.getLastNativeNonce(bridgeType, reportsCollection)

      assert.deepStrictEqual(valueAfterEdit, expectedValue)
    })

    it('Should set the last HOST nonce successfully', async () => {
      const valueBeforeEdit = await db.getLastHostNonce(bridgeType, reportsCollection)
      const expectedValue = valueBeforeEdit + 1
      await db.setLastHostNonce(bridgeType, reportsCollection, expectedValue)
      const valueAfterEdit = await db.getLastHostNonce(bridgeType, reportsCollection)

      assert.deepStrictEqual(valueAfterEdit, expectedValue)
    })
  })

  describe('getReport', () => {
    it('Should get the NATIVE report successfully', async () => {
      const report = await db.getNativeReport(bridgeType, legacy, reportsCollection, 2)

      const expectedReportId = 'pbtc-on-int-btc-2'

      assert.deepStrictEqual(report._id, expectedReportId)
    })

    it('Should get the HOST report successfully', async () => {
      const report = await db.getHostReport(bridgeType, legacy, reportsCollection, 5)

      const expectedReportId = 'pbtc-on-int-int-5'

      assert.deepStrictEqual(report._id, expectedReportId)
    })
  })

  describe('approveReport', () => {
    it('Should approve a HOST report successfully', async () => {
      const nonce = 23
      const originalReport = await db.getHostReport(bridgeType, legacy, reportsCollection, nonce)

      assert.deepStrictEqual(originalReport[db.REPORTS_KEY_BROADCAST], false)
      assert.deepStrictEqual(originalReport[db.REPORTS_KEY_BROADCAST_TX_HASH], null)
      assert.deepStrictEqual(originalReport[db.REPORTS_KEY_BROADCAST_TIMESTAMP], null)

      await db.approveHostReport(bridgeType, legacy, reportsCollection, nonce, null)

      const approvedReport = await db.getHostReport(bridgeType, legacy, reportsCollection, nonce)

      assert.deepStrictEqual(approvedReport[db.REPORTS_KEY_BROADCAST], true)
      assert.deepStrictEqual(
        approvedReport[db.REPORTS_KEY_BROADCAST_TX_HASH],
        '0xf33e4dbe401666ba9170b9bdbc7d02142e69570ed498b4775f45d58786917cd9'
      )
      assert.ok(approvedReport[db.REPORTS_KEY_BROADCAST_TIMESTAMP])
    })

    it('Should approve a NATIVE report with the given hash', async () => {
      const nonce = 11
      const newTxHash = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      const originalReport = await db.getNativeReport(bridgeType, legacy, reportsCollection, nonce)

      assert.deepStrictEqual(originalReport[db.REPORTS_KEY_BROADCAST], false)
      assert.deepStrictEqual(originalReport[db.REPORTS_KEY_BROADCAST_TX_HASH], null)
      assert.deepStrictEqual(originalReport[db.REPORTS_KEY_BROADCAST_TIMESTAMP], null)

      await db.approveNativeReport(bridgeType, legacy, reportsCollection, nonce, newTxHash)

      const approvedReport = await db.getNativeReport(bridgeType, legacy, reportsCollection, nonce)

      assert.deepStrictEqual(approvedReport[db.REPORTS_KEY_BROADCAST], true)
      assert.deepStrictEqual(approvedReport[db.REPORTS_KEY_BROADCAST_TX_HASH], newTxHash)
      assert.ok(approvedReport[db.REPORTS_KEY_BROADCAST_TIMESTAMP])
    })
  })

  describe('setBroadcastStatus', () => {
    it('Should set the broadcast status successfully', async () => {
      const nonce = 10
      const originalReport = await db.getNativeReport(bridgeType, legacy, reportsCollection, nonce)

      assert.equal(originalReport[db.REPORTS_KEY_BROADCAST], true)

      await db.setNativeBroadcastStatus(bridgeType, legacy, reportsCollection, nonce, false)

      const changedReport = await db.getNativeReport(bridgeType, legacy, reportsCollection, nonce)

      assert.equal(changedReport[db.REPORTS_KEY_BROADCAST], false)
    })
  })

  describe('setLastProcessedBlock', () => {
    it('Should set the last NATIVE processed block successfully', async () => {
      const number = 123
      await db.setLastProcessedNativeBlock(bridgeType, reportsCollection, number)
      const result = await db.getLastProcessedNativeBlock(bridgeType, reportsCollection)

      assert.deepStrictEqual(result, number)
    })

    it('Should set the last HOST processed block successfully', async () => {
      const number = 123
      await db.setLastProcessedHostBlock(bridgeType, reportsCollection, number)
      const result = await db.getLastProcessedHostBlock(bridgeType, reportsCollection)

      assert.deepStrictEqual(result, number)
    })
  })
})
