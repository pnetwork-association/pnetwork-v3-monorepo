const ethers = require('ethers')
const R = require('ramda')
const constants = require('ptokens-constants')
const { db, utils, logic } = require('ptokens-utils')

const {
  STATE_ONCHAIN_REQUESTS,
  STATE_DETECTED_DB_REPORTS,
  STATE_PROPOSED_DB_REPORTS,
  STATE_FINALIZED_DB_REPORTS,
  STATE_TO_BE_DISMISSED_REQUESTS,
  STATE_DISMISSED_DB_REPORTS,
  STATE_PENDING_CHALLENGES,
} = require('../../lib/state/constants')
const requestsReports = require('../samples/detected-report-set.json')
const actorsPropagatedReports = require('../samples/actors-propagated-report-set')
const queuedReports = require('../samples/queued-report-set.json')
const pendingChallenges = require('../samples/pending-challenges-report-set')

describe('Tests for queued requests detection and dismissal', () => {
  let collection = null
  const uri = global.__MONGO_URI__
  const dbName = global.__MONGO_DB_NAME__
  const table = 'test'
  // secretlint-disable-next-line
  const privKey = '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e'
  const gpgEncryptedFile = './identity.gpg'

  beforeAll(async () => {
    collection = await db.getCollection(uri, dbName, table)
  })

  afterAll(async () => {
    await db.closeConnection(uri)
  })

  describe('maybeProcessNewRequestsAndDismiss', () => {
    beforeEach(async () => {
      const reports = [...queuedReports, ...requestsReports, ...actorsPropagatedReports]
      jest.restoreAllMocks()
      await Promise.all(reports.map(R.prop('_id'))).then(_ids =>
        Promise.all(_ids.map(db.deleteReport(collection)))
      )
      await collection.insertMany(reports)
    })

    it('Should put invalid transactions to be dismissed into state', async () => {
      const expectedCallResult = [
        {
          // secretlint-disable-next-line
          hash: '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
        },
        {
          // secretlint-disable-next-line
          hash: '0x2c7e8870be7643d97699bbcf3396dfb13217ee54a6784abfcacdb1e077fe201f',
        },
        {
          // secretlint-disable-next-line
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
        protocolCancelOperation: mockCancelOperation,
        operationStatusOf: mockOperationStatusOf,
      }))

      jest.spyOn(utils, 'readIdentityFileSync').mockReturnValue(privKey)
      jest.spyOn(utils, 'readIdentityFileSync').mockReturnValue(privKey)

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

      expect(mockOperationStatusOf).toHaveBeenCalledTimes(3)
      expect(mockCancelOperation).toHaveBeenCalledTimes(2)
      expect(cancelledReports.map(R.prop(constants.db.KEY_ID))).toStrictEqual([
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

      const cancelledEvents = await db.findReports(collection, {
        [constants.db.KEY_STATUS]: constants.db.txStatus.CANCELLED,
      })

      expect(cancelledEvents).toHaveLength(2)
    })
  })

  describe('Solve pending challenges', () => {
    beforeEach(async () => {
      const reports = [...pendingChallenges, ...actorsPropagatedReports]
      jest.restoreAllMocks()
      await Promise.all(reports.map(R.prop('_id'))).then(_ids =>
        Promise.all(_ids.map(db.deleteReport(collection)))
      )
      await collection.insertMany(reports)
    })

    it('Should detect pending challenges and solve the pertinent ones', async () => {
      const finalizedTxHashes = [
        // secretlint-disable-next-line
        '0x3319a74fd2e369da02c230818d5196682daaf86d213ce5257766858558ee5462',
        // secretlint-disable-next-line
        '0x5639789165d988f45f55bc8fcfc5bb24a6000b2669d0d2f1524f693ce3e4588f',
      ]
      const expectedCallResults = [
        {
          [constants.evm.ethers.KEY_TX_HASH]: finalizedTxHashes[0],
        },
        {
          [constants.evm.ethers.KEY_TX_HASH]: finalizedTxHashes[1],
        },
      ]

      const mockSolveChallenge = jest.fn().mockResolvedValue({
        wait: jest
          .fn()
          .mockResolvedValueOnce(expectedCallResults[0])
          .mockResolvedValueOnce(expectedCallResults[1]),
      })

      jest.spyOn(logic, 'sleepForXMilliseconds').mockImplementation(_ => Promise.resolve())
      jest
        .spyOn(logic, 'sleepThenReturnArg')
        .mockImplementation(R.curry((_, _r) => Promise.resolve(_r)))

      jest.spyOn(ethers, 'JsonRpcProvider').mockReturnValue({})
      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        solveChallenge: mockSolveChallenge,
      }))

      jest.spyOn(utils, 'readIdentityFileSync').mockReturnValue(privKey)

      const state = {
        [constants.state.KEY_DB]: collection,
        [constants.state.KEY_LOOP_SLEEP_TIME]: 1,
        [constants.state.KEY_CHALLENGE_PERIOD]: 20,
        [constants.state.KEY_NETWORK_ID]: '0xe15503e4',
        [constants.state.KEY_HUB_ADDRESS]: '0xC8E4270a6EF24B67eD38046318Fc8FC2d312f73C',
        [constants.state.KEY_IDENTITY_FILE]: gpgEncryptedFile,
      }

      const {
        maybeProcessNewRequestsAndDismiss,
      } = require('../../lib/evm/evm-process-dismissal-txs')

      const result = await maybeProcessNewRequestsAndDismiss(state)

      expect(result).toHaveProperty(constants.state.KEY_DB)
      expect(result).not.toHaveProperty(STATE_PENDING_CHALLENGES)
      expect(result).toHaveProperty(constants.state.KEY_IDENTITY_FILE)

      const solvedChallenges = await db.findReports(collection, {
        [constants.db.KEY_STATUS]: constants.db.txStatus.SOLVED,
      })

      expect(solvedChallenges).toHaveLength(1)

      await maybeProcessNewRequestsAndDismiss(state)

      expect(mockSolveChallenge.mock.calls).toHaveLength(1)
    })
  })
})
