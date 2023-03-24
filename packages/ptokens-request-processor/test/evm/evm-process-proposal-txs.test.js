const fs = require('fs')
const {
  jestMockEthers,
  jestMockContractConstructor,
} = require('./mock/jest-utils')
const { prop } = require('ramda')
const { db, constants } = require('ptokens-utils')
const schemas = require('ptokens-schemas')
const detectedEvents = require('../samples/detected-report-set')

describe('Main EVM flow for transaction proposal tests', () => {
  describe('maybeProcessNewRequestsAndPropose', () => {
    let collection = null
    const uri = global.__MONGO_URI__
    const dbName = global.__MONGO_DB_NAME__
    const table = 'test'
    const gpgEncryptedFile = './identity.gpg'
    const privKey = '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e'

    beforeAll(async () => {
      collection = await db.getCollection(uri, dbName, table)
      fs.writeFileSync(gpgEncryptedFile, privKey)
    })

    beforeEach(async () => {
      await collection.insertMany(detectedEvents)
    })

    afterEach(async () => {
      await Promise.all(detectedEvents.map(prop('_id'))).then(_ids =>
        Promise.all(_ids.map(db.deleteReport(collection)))
      )
    })

    afterAll(async () => {
      await db.closeConnection(uri)
      fs.rmSync(gpgEncryptedFile)
    })

    it('Should detect the new events and build the proposals', async () => {
      const ethers = jestMockEthers()
      const proposedTxHashes = [
        '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
        '0x2c7e8870be7643d97699bbcf3396dfb13217ee54a6784abfcacdb1e077fe201f',
      ]
      const expecteCallResult = [
        {
          transactionHash: proposedTxHashes[0],
        },
        {
          transactionHash: proposedTxHashes[1],
        },
      ]

      const mockPegOut = jest.fn().mockResolvedValue({
        wait: jest.fn()
          .mockResolvedValueOnce(expecteCallResult[0])
          .mockResolvedValueOnce(expecteCallResult[1]),
      })

      ethers.Contract = jestMockContractConstructor('pegOut', mockPegOut)

      const state = {
        [constants.STATE_KEY_DB]: collection,
        [schemas.constants.SCHEMA_IDENTITY_GPG_KEY]: gpgEncryptedFile,
        [schemas.constants.SCHEMA_CHAIN_ID_KEY]: '0x01ec97de',
      }

      const {
        maybeProcessNewRequestsAndPropose,
      } = require('../../lib/evm/evm-process-proposal-txs')

      const result = await maybeProcessNewRequestsAndPropose(state)

      console.log(result)
    })
  })
})
