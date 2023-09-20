const {
  STATE_ONCHAIN_REQUESTS,
  STATE_DETECTED_DB_REPORTS,
  STATE_PROPOSED_DB_REPORTS,
  STATE_FINALIZED_DB_REPORTS,
} = require('../../lib/state/constants')
const R = require('ramda')
const { db, utils, logic } = require('ptokens-utils')
const constants = require('ptokens-constants')

const proposedEvents = require('../samples/proposed-report-set').slice(0, 2)

describe('Main EVM flow for transaction proposal tests', () => {
  describe('maybeProcessFinalTransactions', () => {
    let collection = null
    const uri = global.__MONGO_URI__
    const dbName = global.__MONGO_DB_NAME__
    const table = 'test'

    const privKey = '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e'
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

      const finalizedTxHashes = [
        '0x3319a74fd2e369da02c230818d5196682daaf86d213ce5257766858558ee5462',
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

      const mockExecuteOperation = jest.fn().mockResolvedValue({
        wait: jest
          .fn()
          .mockResolvedValueOnce(expectedCallResults[0])
          .mockResolvedValueOnce(expectedCallResults[1]),
      })

      const mockChallengePeriodOf = jest
        .fn()
        .mockResolvedValueOnce([1680615440, 1680616620])
        .mockResolvedValueOnce([1680615440, 1680619040])
        .mockResolvedValueOnce([1680615440, 1680622640])
        .mockResolvedValueOnce([1680615440, 1680616620])
        .mockResolvedValueOnce([1680615440, 1680616620])

      jest.spyOn(logic, 'sleepForXMilliseconds').mockImplementation(_ => Promise.resolve())
      jest
        .spyOn(logic, 'sleepThenReturnArg')
        .mockImplementation(R.curry((_, _r) => Promise.resolve(_r)))

      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        protocolExecuteOperation: mockExecuteOperation,
        challengePeriodOf: mockChallengePeriodOf,
      }))

      jest.spyOn(utils, 'readIdentityFile').mockResolvedValue(privKey)

      const state = {
        [constants.state.KEY_DB]: collection,
        [constants.state.KEY_LOOP_SLEEP_TIME]: 1,
        [constants.state.KEY_CHALLENGE_PERIOD]: 20,
        [constants.state.KEY_NETWORK_ID]: '0xe15503e4',
        [constants.state.KEY_HUB_ADDRESS]: '0xC8E4270a6EF24B67eD38046318Fc8FC2d312f73C',
        [constants.state.KEY_IDENTITY_FILE]: gpgEncryptedFile,
      }

      const { maybeProcessFinalTransactions } = require('../../lib/evm/evm-process-final-txs')

      const result = await maybeProcessFinalTransactions(state)

      expect(result).toHaveProperty(constants.state.KEY_DB)
      expect(result).not.toHaveProperty(STATE_ONCHAIN_REQUESTS)
      expect(result).not.toHaveProperty(STATE_DETECTED_DB_REPORTS)
      expect(result).not.toHaveProperty(STATE_PROPOSED_DB_REPORTS)
      expect(result).not.toHaveProperty(STATE_FINALIZED_DB_REPORTS)
      expect(result).toHaveProperty(constants.state.KEY_IDENTITY_FILE)

      const finalizedEvents = await db.findReports(collection, {
        [constants.db.KEY_STATUS]: constants.db.txStatus.FINALIZED,
      })

      expect(finalizedEvents).toHaveLength(2)
    })
  })
})
