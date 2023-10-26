const ethers = require('ethers')
const assert = require('assert')
const constants = require('ptokens-constants')
const { MerkleTree } = require('merkletreejs')
const { getMerkleProof } = require('../../lib/utils')

describe('Get Merkle path general tests', () => {
  const guardianAddress = '0x0Ef13B2668dbE1b3eDfe9fFb7CbC398363b50f79'
  const guardianType = constants.hub.actors.Guardian

  describe('getMerkleProof', () => {
    it('Should get the expected Merkle path', async () => {
      const epoch = 8
      const actors = [
        '0x0Ef13B2668dbE1b3eDfe9fFb7CbC398363b50f79',
        '0x936BD5cDA593DF24Cc13bEB228E982D8feFC3F60',
        '0x5EeDe0a0E799B0ac61192bc946e0B0Eba5A89265',
        '0x55f709DcCB4075BC2DBD43E5aF093f4bCb5127f8',
        '0xF3f036EBC0d989301c220c9DBa74a4A60e143526',
        '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
      ]
      const actorsTypes = [1, 1, 2, 2, 2, 1]
      const proof = await getMerkleProof(epoch, actors, actorsTypes, guardianAddress)

      // secretlint-disable
      assert.deepStrictEqual(proof, [
        '0x9b4b8693def1b0d3a79263f50433d948d5295d3e84219adb5ab3a1eb133d03b9',
        '0x086da0408e2daaf3925bab95aa569df91aff43abdd66bb87025511ef461207f0',
        '0x4e90f2b7b9467dc452efa5192c93ec3d85b15e6afc697a05154e689dda1e4d67',
      ])
      // secretlint-enable

      const leaves = actors.map((_address, _index) =>
        ethers.solidityPackedKeccak256(['address', 'uint8'], [_address, actorsTypes[_index]])
      )

      const tree = new MerkleTree(leaves, ethers.keccak256, {
        sortPairs: true,
      })

      const myLeaf = ethers.solidityPackedKeccak256(
        ['address', 'uint8'],
        [guardianAddress, guardianType]
      )

      const root = tree.getHexRoot()

      assert(tree.verify(proof, myLeaf, root))
    })
  })
})
