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

      jest.spyOn(logic, 'sleepForXMilliseconds').mockImplementation(_ => Promise.resolve())
      jest
        .spyOn(logic, 'sleepThenReturnArg')
        .mockImplementation(R.curry((_, _r) => Promise.resolve(_r)))

      const evmBuildDismissalModule = require('../../lib/evm/evm-build-dismissal-txs')

      jest.spyOn(evmBuildDismissalModule, 'maybeBuildDismissalTxsAndPutInState').mockImplementation(
        R.assoc(STATE_DISMISSED_DB_REPORTS, [
          {
            ...queuedReports[0],
            [constants.db.KEY_STATUS]: constants.db.txStatus.CANCELLED,
          },
          {
            ...queuedReports[1],
            [constants.db.KEY_STATUS]: constants.db.txStatus.CANCELLED,
          },
          {
            ...queuedReports[2],
            [constants.db.KEY_STATUS]: constants.db.txStatus.CANCELLED,
          },
        ])
      )

      const {
        maybeProcessNewRequestsAndDismiss,
      } = require('../../lib/evm/evm-process-dismissal-txs')
      const state = {
        [constants.state.KEY_LOOP_SLEEP_TIME]: 1,
        [constants.state.KEY_NETWORK_ID]: '0xe15503e4',
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

      expect(cancelledReports.map(R.prop(constants.db.KEY_ID))).toStrictEqual([
        queuedReports[0][constants.db.KEY_ID],
        queuedReports[1][constants.db.KEY_ID],
        queuedReports[2][constants.db.KEY_ID],
      ])
      expect(result).toHaveProperty(constants.state.KEY_DB)
      expect(result).not.toHaveProperty(STATE_ONCHAIN_REQUESTS)
      expect(result).not.toHaveProperty(STATE_DETECTED_DB_REPORTS)
      expect(result).not.toHaveProperty(STATE_PROPOSED_DB_REPORTS)
      expect(result).not.toHaveProperty(STATE_FINALIZED_DB_REPORTS)
      expect(result).not.toHaveProperty(STATE_TO_BE_DISMISSED_REQUESTS)
      expect(result).not.toHaveProperty(STATE_DISMISSED_DB_REPORTS)
      expect(result).toHaveProperty(constants.state.KEY_IDENTITY_FILE)
    })
  })
})
