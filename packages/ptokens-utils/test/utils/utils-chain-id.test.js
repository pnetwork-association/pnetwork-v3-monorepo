const assert = require('assert')
const { values } = require('ramda')
const { utils, constants } = require('../..')

describe('Chain ID utils tests', () => {
  describe('getBlockchainTypeFromChainId', () => {
    it('Should get the correct blockchain type', () => {
      const expectedResults = [
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
      values(constants.metadataChainIds).map((_chainId, _i) =>
        assert.equal(
          utils.getBlockchainTypeFromChainId(_chainId),
          expectedResults[_i]
        )
      )
    })
  })
})
