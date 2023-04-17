const { jestMockContractConstructor } = require('./mock/jest-utils')
const {
  STATE_ONCHAIN_REQUESTS_KEY,
  STATE_DETECTED_DB_REPORTS_KEY,
  STATE_PROPOSED_DB_REPORTS_KEY,
  STATE_FINALIZED_DB_REPORTS_KEY,
} = require('../../lib/state/constants')
const R = require('ramda')
const { db, logic } = require('ptokens-utils')
const constants = require('ptokens-constants')
const schemas = require('ptokens-schemas')
const proposedEvents = require('../samples/proposed-report-set').slice(0, 2)

describe('Main EVM flow for transaction proposal tests', () => {
  describe('maybeProcessFinalTransactions', () => {
    let collection = null
    const uri = global.__MONGO_URI__
    const dbName = global.__MONGO_DB_NAME__
    const table = 'test'

    const privKey =
      '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e'
    const gpgEncryptedFile = './identity.gpg'

    beforeAll(async () => {
      collection = await db.getCollection(uri, dbName, table)
    })

    beforeEach(async () => {
      await collection.insertMany(proposedEvents)
    })

    afterEach(async () => {
      await Promise.all(proposedEvents.map(R.prop('_id'))).then(_ids =>
        Promise.all(_ids.map(db.deleteReport(collection)))
      )
      jest.restoreAllMocks()
    })

    afterAll(async () => {
      await db.closeConnection(uri)
    })

    it('Should finalize proposed events which challenge period has expired', async () => {
      const ethers = require('ethers')
      const fs = require('fs/promises')

      const finalizedTxHashes = [
        '0x3319a74fd2e369da02c230818d5196682daaf86d213ce5257766858558ee5462',
        '0x5639789165d988f45f55bc8fcfc5bb24a6000b2669d0d2f1524f693ce3e4588f',
      ]
      const expectedCallResults = [
        {
          hash: finalizedTxHashes[0],
        },
        {
          hash: finalizedTxHashes[1],
        },
      ]

      const mockExecuteOperation = jest.fn().mockResolvedValue({
        wait: jest
          .fn()
          .mockResolvedValueOnce(expectedCallResults[0])
          .mockResolvedValueOnce(expectedCallResults[1]),
      })

      jest
        .spyOn(logic, 'sleepForXMilliseconds')
        .mockImplementation(_ => Promise.resolve())
      jest
        .spyOn(logic, 'sleepThenReturnArg')
        .mockImplementation(R.curry((_, _r) => Promise.resolve(_r)))

      jest
        .spyOn(ethers, 'Contract')
        .mockImplementation(
          jestMockContractConstructor(
            'protocolExecuteOperation',
            mockExecuteOperation
          )
        )

      jest.spyOn(fs, 'readFile').mockResolvedValue(privKey)

      const state = {
        [constants.state.STATE_KEY_DB]: collection,
        [constants.state.STATE_KEY_LOOP_SLEEP_TIME]: 1,
        [constants.state.STATE_KEY_CHALLENGE_PERIOD]: 20,
        [constants.state.STATE_KEY_CHAIN_ID]: '0xe15503e4',
        [constants.state.STATE_KEY_STATE_MANAGER_ADDRESS]:
          '0xC8E4270a6EF24B67eD38046318Fc8FC2d312f73C',
        [constants.state.STATE_KEY_IDENTITY_FILE]: gpgEncryptedFile,
      }

      const {
        maybeProcessFinalTransactions,
      } = require('../../lib/evm/evm-process-final-txs')

      const result = await maybeProcessFinalTransactions(state)

      expect(result).toHaveProperty(constants.state.STATE_KEY_DB)
      expect(result).not.toHaveProperty(STATE_ONCHAIN_REQUESTS_KEY)
      expect(result).not.toHaveProperty(STATE_DETECTED_DB_REPORTS_KEY)
      expect(result).not.toHaveProperty(STATE_PROPOSED_DB_REPORTS_KEY)
      expect(result).not.toHaveProperty(STATE_FINALIZED_DB_REPORTS_KEY)
      expect(result).toHaveProperty(constants.state.STATE_KEY_IDENTITY_FILE)

      const finalizedEvents = await db.findReports(collection, {
        [schemas.constants.SCHEMA_STATUS_KEY]:
          schemas.db.enums.txStatus.FINALIZED,
      })

      expect(finalizedEvents).toHaveLength(2)
    })
  })
})
