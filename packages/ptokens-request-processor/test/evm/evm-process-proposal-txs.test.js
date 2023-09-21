const R = require('ramda')
const { db, logic, utils } = require('ptokens-utils')

const constants = require('ptokens-constants')
const {
  STATE_ONCHAIN_REQUESTS,
  STATE_DETECTED_DB_REPORTS,
  STATE_PROPOSED_DB_REPORTS,
} = require('../../lib/state/constants')
const detectedEvents = require('../samples/detected-report-set').slice(0, 2)

describe('Main EVM flow for transaction proposal tests', () => {
  describe('maybeProcessNewRequestsAndPropose', () => {
    let collection = null
    const uri = global.__MONGO_URI__
    const dbName = global.__MONGO_DB_NAME__
    const table = 'test'
    const gpgEncryptedFile = './identity3.gpg'
    const privKey = '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e'

    beforeAll(async () => {
      collection = await db.getCollection(uri, dbName, table)
    })

    beforeEach(async () => {
      await collection.deleteMany({})
      await collection.insertMany(detectedEvents)
    })

    afterAll(async () => {
      await db.closeConnection(uri)
    })

    it('Should detect the new events and build the proposals', async () => {
      const ethers = require('ethers')

      const proposedTxHashes = [
        '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
        '0x2c7e8870be7643d97699bbcf3396dfb13217ee54a6784abfcacdb1e077fe201f',
      ]

      const expectedCallResult = [
        {
          hash: proposedTxHashes[0],
        },
        {
          hash: proposedTxHashes[1],
        },
      ]

      jest.spyOn(logic, 'sleepForXMilliseconds').mockImplementation(_ => Promise.resolve())
      jest
        .spyOn(logic, 'sleepThenReturnArg')
        .mockImplementation(R.curry((_, _r) => Promise.resolve(_r)))

      const mockOperationStatusOf = jest.fn().mockResolvedValue('0x00')
      const mockLockedAmountChallengePeriod = jest.fn().mockResolvedValue(1)
      const mockQueueOperation = jest.fn().mockResolvedValue({
        wait: jest
          .fn()
          .mockResolvedValueOnce(expectedCallResult[0])
          .mockResolvedValueOnce(expectedCallResult[1]),
      })

      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        protocolQueueOperation: mockQueueOperation,
        operationStatusOf: mockOperationStatusOf,
        lockedAmountChallengePeriod: mockLockedAmountChallengePeriod,
      }))

      jest.spyOn(utils, 'readIdentityFile').mockResolvedValue(privKey)

      const state = {
        [constants.state.KEY_DB]: collection,
        [constants.state.KEY_LOOP_SLEEP_TIME]: 1,
        [constants.state.KEY_IDENTITY_FILE]: gpgEncryptedFile,
        [constants.state.KEY_NETWORK_ID]: '0xf9b459a1',
      }
      const {
        maybeProcessNewRequestsAndPropose,
      } = require('../../lib/evm/evm-process-proposal-txs')
      const result = await maybeProcessNewRequestsAndPropose(state)

      expect(mockLockedAmountChallengePeriod).toHaveBeenCalledTimes(1)
      expect(result).toHaveProperty(constants.state.KEY_DB)
      expect(result).not.toHaveProperty(STATE_ONCHAIN_REQUESTS)
      expect(result).not.toHaveProperty(STATE_DETECTED_DB_REPORTS)
      expect(result).not.toHaveProperty(STATE_PROPOSED_DB_REPORTS)
      expect(result).toHaveProperty(constants.state.KEY_IDENTITY_FILE)

      const proposedEvents = await db.findReports(collection, {
        [constants.db.KEY_STATUS]: constants.db.txStatus.PROPOSED,
      })

      expect(proposedEvents).toHaveLength(1)
    })
  })
})
