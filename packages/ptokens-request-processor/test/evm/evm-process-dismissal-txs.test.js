const R = require('ramda')
const constants = require('ptokens-constants')
const { db } = require('ptokens-utils')

const {
  STATE_ONCHAIN_REQUESTS,
  STATE_DETECTED_DB_REPORTS,
  STATE_PROPOSED_DB_REPORTS,
  STATE_FINALIZED_DB_REPORTS,
  STATE_TO_BE_DISMISSED_REQUESTS,
  STATE_DISMISSED_DB_REPORTS,
} = require('../../lib/state/constants')
const queuedReports = require('../samples/queued-report-set.json')
const requestsReports = require('../samples/detected-report-set.json')
const reports = [...queuedReports, ...requestsReports]

describe('Tests for queued requests detection and dismissal', () => {
  describe('maybeProcessNewRequestsAndDismiss', () => {
    let collection = null
    const uri = global.__MONGO_URI__
    const dbName = global.__MONGO_DB_NAME__
    const table = 'test'
    const privKey = '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e'

    beforeAll(async () => {
      collection = await db.getCollection(uri, dbName, table)
    })

    beforeEach(async () => {
      await collection.insertMany(reports)
    })

    afterEach(async () => {
      await Promise.all(reports.map(R.prop('_id'))).then(_ids =>
        Promise.all(_ids.map(db.deleteReport(collection)))
      )
      jest.restoreAllMocks()
    })

    afterAll(async () => {
      await db.closeConnection(uri)
    })

    it('Should put invalid transactions to be dismissed into state', async () => {
      const { logic } = require('ptokens-utils')
      const fs = require('fs/promises')
      const ethers = require('ethers')

      const expectedCallResult = [
        {
          hash: '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
        },
        {
          hash: '0x2c7e8870be7643d97699bbcf3396dfb13217ee54a6784abfcacdb1e077fe201f',
        },
        {
          hash: '0xbaa9e89896c03366c3578a4568a6defd4b127e4b09bb06b67a12cb1a4c332376',
        },
      ]

      jest.spyOn(logic, 'sleepForXMilliseconds').mockImplementation(_ => Promise.resolve())
      jest
        .spyOn(logic, 'sleepThenReturnArg')
        .mockImplementation(R.curry((_, _r) => Promise.resolve(_r)))

      const mockOperationStatusOf = jest.fn().mockResolvedValue('0x01')
      const mockCancelOperation = jest.fn().mockResolvedValue({
        wait: jest
          .fn()
          .mockResolvedValueOnce(expectedCallResult[0])
          .mockResolvedValueOnce(expectedCallResult[1])
          .mockResolvedValueOnce(expectedCallResult[2]),
      })

      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        protocolGuardianCancelOperation: mockCancelOperation,
        operationStatusOf: mockOperationStatusOf,
      }))

      jest.spyOn(fs, 'readFile').mockResolvedValue(privKey)

      const {
        maybeProcessNewRequestsAndDismiss,
      } = require('../../lib/evm/evm-process-dismissal-txs')
      const state = {
        [constants.state.KEY_LOOP_SLEEP_TIME]: 1,
        [constants.state.KEY_NETWORK_ID]: '0xf9b459a1',
        [constants.state.KEY_DB]: collection,
        [constants.state.KEY_IDENTITY_FILE]: 'identity-file',
      }

      expect(
        await db.findReports(collection, {
          [constants.db.KEY_STATUS]: constants.db.txStatus.CANCELLED,
        })
      ).toStrictEqual([])

      const result = await maybeProcessNewRequestsAndDismiss(state)

      const cancelledReports = await db.findReports(collection, {
        [constants.db.KEY_STATUS]: constants.db.txStatus.CANCELLED,
      })

      expect(mockOperationStatusOf).toHaveBeenCalledTimes(2)
      expect(mockCancelOperation).toHaveBeenCalledTimes(1)
      expect(cancelledReports.map(R.prop(constants.db.KEY_ID))).toStrictEqual([
        queuedReports[1][constants.db.KEY_ID],
      ])
      expect(result).toHaveProperty(constants.state.KEY_DB)
      expect(result).not.toHaveProperty(STATE_ONCHAIN_REQUESTS)
      expect(result).not.toHaveProperty(STATE_DETECTED_DB_REPORTS)
      expect(result).not.toHaveProperty(STATE_PROPOSED_DB_REPORTS)
      expect(result).not.toHaveProperty(STATE_FINALIZED_DB_REPORTS)
      expect(result).not.toHaveProperty(STATE_TO_BE_DISMISSED_REQUESTS)
      expect(result).not.toHaveProperty(STATE_DISMISSED_DB_REPORTS)
      expect(result).toHaveProperty(constants.state.KEY_IDENTITY_FILE)

      const cancelledEvents = await db.findReports(collection, {
        [constants.db.KEY_STATUS]: constants.db.txStatus.CANCELLED,
      })

      expect(cancelledEvents).toHaveLength(1)
    })
  })
})
