const ethers = require('ethers')
const errors = require('../../lib/errors')
const constants = require('ptokens-constants')
const { db } = require('ptokens-utils')
const { getMerkleProof } = require('../../lib/evm/get-merkle-proof')
const { MerkleTree } = require('merkletreejs')
const { keccak256, encodePacked } = require('viem')
const actorsPropagatedSamples = require('../samples/actors-propagated-report-set')

describe('Get Merkle path general tests', () => {
  const dbName = global.__MONGO_DB_NAME__
  const tableName = 'test'
  let collection = null
  const uri = global.__MONGO_URI__
  const guardianAddress = '0x0Ef13B2668dbE1b3eDfe9fFb7CbC398363b50f79'
  const guardianType = constants.hub.actors.Guardian

  beforeAll(async () => {
    collection = await db.getCollection(uri, dbName, tableName)
  })

  afterAll(async () => {
    await db.closeConnection(uri)
  })

  describe('getMerkleProof', () => {
    beforeAll(async () => {
      await collection.deleteMany({})
      await db.insertReports(collection, actorsPropagatedSamples)
    })

    it('Should get the expected Merkle path', async () => {
      const proof = await getMerkleProof(collection, guardianAddress)
      const eventArgs = actorsPropagatedSamples[1][constants.db.KEY_EVENT_ARGS]
      const actors = eventArgs[1]
      const actorsTypes = eventArgs[2]

      // secretlint-disable
      expect(proof).toStrictEqual([
        '0x9b4b8693def1b0d3a79263f50433d948d5295d3e84219adb5ab3a1eb133d03b9',
        '0x086da0408e2daaf3925bab95aa569df91aff43abdd66bb87025511ef461207f0',
        '0x4e90f2b7b9467dc452efa5192c93ec3d85b15e6afc697a05154e689dda1e4d67',
      ])
      // secretlint-enable

      const leaves = actors.map((_address, _index) =>
        keccak256(encodePacked(['address', 'uint8'], [_address, actorsTypes[_index]]))
      )

      const tree = new MerkleTree(leaves, ethers.keccak256, {
        sortPairs: true,
      })

      const myLeaf = keccak256(encodePacked(['address', 'uint8'], [guardianAddress, guardianType]))

      const root = tree.getHexRoot()

      expect(tree.verify(proof, myLeaf, root)).toBeTruthy()
    })

    it('Should fail when no epoch is defined', () => {
      const sampleWithEmptyArgs = {
        ...actorsPropagatedSamples[0],
        [constants.db.KEY_EVENT_ARGS]: [],
        [constants.db.KEY_ID]: 'actorspropagated_0x1234',
        [constants.db.KEY_WITNESSED_TS]: new Date().toISOString(),
      }

      db.insertReport(collection, sampleWithEmptyArgs)

      return expect(getMerkleProof(collection, guardianAddress)).rejects.toThrowError(
        errors.ERROR_NO_ACTORS_PROPAGATED_EVENT_FOUND
      )
    })
  })
})
