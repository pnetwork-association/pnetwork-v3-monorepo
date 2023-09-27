const { db } = require('ptokens-utils')
const errors = require('../../lib/errors')
const constants = require('ptokens-constants')
const { getMerkleProof } = require('../../lib/evm/get-merkle-proof')
const guardiansPropagatedSamples = require('../samples/guardians-propagated-report-set')

describe('Get Merkle path general tests', () => {
  const dbName = global.__MONGO_DB_NAME__
  const tableName = 'test'
  let collection = null
  const uri = global.__MONGO_URI__
  const guardianAddress = '0x0Ef13B2668dbE1b3eDfe9fFb7CbC398363b50f79'

  beforeAll(async () => {
    collection = await db.getCollection(uri, dbName, tableName)
  })

  afterAll(async () => {
    await db.closeConnection(uri)
  })

  describe('getMerkleProof', () => {
    beforeAll(async () => {
      await collection.deleteMany({})
      await db.insertReports(collection, guardiansPropagatedSamples)
    })

    it('Should get the expected Merkle path', async () => {
      const proof = await getMerkleProof(collection, guardianAddress)
      const toHex = _proof => _proof.map(x => x.toString('hex'))

      expect(toHex(proof)).toStrictEqual([
        'f36d7cc927c68348ec892652d199830e344f5838802b0a6534e356fcc91dbccd',
        'd36e34fc1e061ffbf4b9ea3dfd1c24d7424c528ca17d38dbf4f805cd260eec8e',
        'ac7454cfdeed18cba78849037645918d2ff0351021e18a290cad2213790ee165',
      ])
    })

    it('Should fail when no epoch is defined', () => {
      const sampleWithEmptyArgs = {
        ...guardiansPropagatedSamples[0],
        [constants.db.KEY_EVENT_ARGS]: [],
        [constants.db.KEY_ID]: 'guardianspropagated_0x1234',
        [constants.db.KEY_WITNESSED_TS]: new Date().toISOString(),
      }

      db.insertReport(collection, sampleWithEmptyArgs)

      return expect(getMerkleProof(collection, guardianAddress)).rejects.toThrowError(
        errors.ERROR_NIL_ARGUMENTS
      )
    })
  })
})
