const { jestMockContractConstructor } = require('./mock/jest-utils')
const R = require('ramda')
const { db, logic } = require('ptokens-utils')
const schemas = require('ptokens-schemas')
const constants = require('ptokens-constants')
const {
  STATE_ONCHAIN_REQUESTS_KEY,
  STATE_DETECTED_DB_REPORTS_KEY,
  STATE_PROPOSED_DB_REPORTS_KEY,
} = require('../../lib/state/constants')
const detectedEvents = require('../samples/detected-report-set').slice(0, 2)

describe('Main EVM flow for transaction proposal tests', () => {
  describe('maybeProcessNewRequestsAndPropose', () => {
    let collection = null
    const uri = global.__MONGO_URI__
    const dbName = global.__MONGO_DB_NAME__
    const table = 'test'
    const gpgEncryptedFile = './identity3.gpg'
    const privKey =
      '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e'

    beforeAll(async () => {
      collection = await db.getCollection(uri, dbName, table)
    })

    beforeEach(async () => {
      await collection.insertMany(detectedEvents)
    })

    afterEach(async () => {
      await Promise.all(detectedEvents.map(R.prop('_id'))).then(_ids =>
        Promise.all(_ids.map(db.deleteReport(collection)))
      )
    })

    afterAll(async () => {
      await db.closeConnection(uri)
    })

    it('Should detect the new events and build the proposals', async () => {
      const ethers = require('ethers')
      const fs = require('fs/promises')

      const proposedTxHashes = [
        '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
        '0x2c7e8870be7643d97699bbcf3396dfb13217ee54a6784abfcacdb1e077fe201f',
      ]

      const expecteCallResult = [
        {
          hash: proposedTxHashes[0],
        },
        {
          hash: proposedTxHashes[1],
        },
      ]
      const mockQueueOperation = jest.fn().mockResolvedValue({
        wait: jest
          .fn()
          .mockResolvedValueOnce(expecteCallResult[0])
          .mockResolvedValueOnce(expecteCallResult[1]),
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
            'protocolQueueOperation',
            mockQueueOperation
          )
        )

      jest.spyOn(fs, 'readFile').mockResolvedValue(privKey)

      const state = {
        [constants.state.STATE_KEY_DB]: collection,
        [constants.state.STATE_KEY_LOOP_SLEEP_TIME]: 1,
        [constants.state.STATE_KEY_IDENTITY_FILE]: gpgEncryptedFile,
        [constants.state.STATE_KEY_NETWORK_ID]: '0xe15503e4',
      }
      const {
        maybeProcessNewRequestsAndPropose,
      } = require('../../lib/evm/evm-process-proposal-txs')
      const result = await maybeProcessNewRequestsAndPropose(state)

      expect(result).toHaveProperty(constants.state.STATE_KEY_DB)
      expect(result).not.toHaveProperty(STATE_ONCHAIN_REQUESTS_KEY)
      expect(result).not.toHaveProperty(STATE_DETECTED_DB_REPORTS_KEY)
      expect(result).not.toHaveProperty(STATE_PROPOSED_DB_REPORTS_KEY)
      expect(result).toHaveProperty(constants.state.STATE_KEY_IDENTITY_FILE)

      const proposedEvents = await db.findReports(collection, {
        [schemas.constants.SCHEMA_STATUS_KEY]:
          schemas.db.enums.txStatus.PROPOSED,
      })

      expect(proposedEvents).toHaveLength(2)
    })
  })
})
