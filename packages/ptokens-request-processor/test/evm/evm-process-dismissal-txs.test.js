const R = require('ramda')
const constants = require('ptokens-constants')
const { db } = require('ptokens-utils')
const schemas = require('ptokens-schemas')
const {
  STATE_ONCHAIN_REQUESTS_KEY,
  STATE_DETECTED_DB_REPORTS_KEY,
  STATE_PROPOSED_DB_REPORTS_KEY,
  STATE_FINALIZED_DB_REPORTS_KEY,
  STATE_TO_BE_DISMISSED_REQUESTS_KEY,
  STATE_DISMISSED_DB_REPORTS_KEY,
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
        R.assoc(STATE_DISMISSED_DB_REPORTS_KEY, [
          {
            ...queuedReports[0],
            [schemas.constants.reportFields.SCHEMA_STATUS_KEY]: schemas.db.enums.txStatus.CANCELLED,
          },
          {
            ...queuedReports[1],
            [schemas.constants.reportFields.SCHEMA_STATUS_KEY]: schemas.db.enums.txStatus.CANCELLED,
          },
          {
            ...queuedReports[2],
            [schemas.constants.reportFields.SCHEMA_STATUS_KEY]: schemas.db.enums.txStatus.CANCELLED,
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
          [schemas.constants.reportFields.SCHEMA_STATUS_KEY]: schemas.db.enums.txStatus.CANCELLED,
        })
      ).toStrictEqual([])

      const result = await maybeProcessNewRequestsAndDismiss(state)

      const cancelledReports = await db.findReports(collection, {
        [schemas.constants.reportFields.SCHEMA_STATUS_KEY]: schemas.db.enums.txStatus.CANCELLED,
      })

      expect(
        cancelledReports.map(R.prop(schemas.constants.reportFields.SCHEMA_ID_KEY))
      ).toStrictEqual([
        queuedReports[0][schemas.constants.reportFields.SCHEMA_ID_KEY],
        queuedReports[1][schemas.constants.reportFields.SCHEMA_ID_KEY],
        queuedReports[2][schemas.constants.reportFields.SCHEMA_ID_KEY],
      ])
      expect(result).toHaveProperty(constants.state.KEY_DB)
      expect(result).not.toHaveProperty(STATE_ONCHAIN_REQUESTS_KEY)
      expect(result).not.toHaveProperty(STATE_DETECTED_DB_REPORTS_KEY)
      expect(result).not.toHaveProperty(STATE_PROPOSED_DB_REPORTS_KEY)
      expect(result).not.toHaveProperty(STATE_FINALIZED_DB_REPORTS_KEY)
      expect(result).not.toHaveProperty(STATE_TO_BE_DISMISSED_REQUESTS_KEY)
      expect(result).not.toHaveProperty(STATE_DISMISSED_DB_REPORTS_KEY)
      expect(result).toHaveProperty(constants.state.KEY_IDENTITY_FILE)
    })
  })
})
