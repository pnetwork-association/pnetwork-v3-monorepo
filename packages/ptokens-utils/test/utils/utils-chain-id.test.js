const assert = require('assert')
const R = require('ramda')
const { utils, constants } = require('../..')

describe('Chain ID utils tests', () => {
  describe('getBlockchainTypeFromChainId', () => {
    it('Should get the correct blockchain type', () => {
      const expectedResults = [
        constants.blockchainType.EVM,
        constants.blockchainType.EVM,
        constants.blockchainType.EVM,
        constants.blockchainType.EVM,
        constants.blockchainType.EVM,
        constants.blockchainType.UTXO,
        constants.blockchainType.UTXO,
        constants.blockchainType.EOSIO,
        constants.blockchainType.EOSIO,
        constants.blockchainType.EVM,
        constants.blockchainType.EOSIO,
        constants.blockchainType.EVM,
        constants.blockchainType.EVM,
        constants.blockchainType.EOSIO,
        constants.blockchainType.EOSIO,
        constants.blockchainType.EOSIO,
        constants.blockchainType.EVM,
        constants.blockchainType.UTXO,
        constants.blockchainType.EOSIO,
        constants.blockchainType.EVM,
        constants.blockchainType.EVM,
        constants.blockchainType.EVM,
        constants.blockchainType.ALGORAND,
        constants.blockchainType.EVM,
        constants.blockchainType.EOSIO,
        constants.blockchainType.EOSIO,
      ]
      return Promise.all(
        R.values(constants.metadataChainIds).map((_val, _i) =>
          utils
            .getBlockchainTypeFromChainId(_val)
            .then(_ret => assert.strictEqual(_ret, expectedResults[_i]))
        )
      )
    })
    it('Should get the correct blockchain type', async () => {
      try {
        await utils.getBlockchainTypeFromChainId('0x01234567')
      } catch (err) {
        assert.equal(err.message, 'Unknown chain ID 0x01234567')
      }
    })
  })
})
