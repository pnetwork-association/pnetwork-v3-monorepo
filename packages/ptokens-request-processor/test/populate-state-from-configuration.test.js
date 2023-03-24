const assert = require('assert')
const { db, validation } = require('ptokens-utils')
const {
  getInitialStateFromConfiguration,
} = require('../lib/populate-state-from-configuration')
const constants = require('ptokens-constants')
const schemas = require('ptokens-schemas')

describe('State utilities tests', () => {
  describe('getInitialStateFromConfiguration', () => {
    it('Should populate the state from the configuration', async () => {
      const config = {
        [schemas.constants.SCHEMA_CHAIN_NAME_KEY]: 'Ethereum Mainnet',
        [schemas.constants.SCHEMA_CHAIN_TYPE_KEY]: 'EVM',
        [schemas.constants.SCHEMA_CHAIN_ID_KEY]: '0x005fe7f9',
        [schemas.constants.SCHEMA_DB_KEY]: {
          [schemas.constants.SCHEMA_URL_KEY]: 'a-url',
          [schemas.constants.SCHEMA_NAME_KEY]: 'a-database-name',
          [schemas.constants.SCHEMA_TABLE_EVENTS_KEY]: 'a-collection-name',
        },
        [schemas.constants.SCHEMA_PROVIDER_URL_KEY]: 'a-provider-url',
        [schemas.constants.SCHEMA_REDEEM_MANAGER_KEY]: '0x1',
        [schemas.constants.SCHEMA_ISSUANCE_MANAGER_KEY]: '0x2',
        [schemas.constants.SCHEMA_IDENTITY_GPG_KEY]: '/usr/src/app/private-key',
        [schemas.constants.SCHEMA_CHALLENGE_PERIOD]: 10,
      }
      expect(
        await validation.validateJson(
          schemas.configurations.requestProcessor,
          config
        )
      ).toBeTruthy()
      jest
        .spyOn(db, 'getCollection')
        .mockImplementation((_url, _dbName, _collectionName) =>
          Promise.resolve(`${_url}/${_dbName}/${_collectionName}`)
        )
      const state = {}
      const ret = await getInitialStateFromConfiguration(config, state)
      assert.deepStrictEqual(ret, {
        [constants.state.STATE_KEY_DB]:
          'a-url/a-database-name/a-collection-name',
        [constants.state.STATE_KEY_CHAIN_ID]: '0x005fe7f9',
        [constants.state.STATE_KEY_PROVIDER_URL]: 'a-provider-url',
        [constants.state.STATE_KEY_REDEEM_MANAGER_ADDRESS]: '0x1',
        [constants.state.STATE_KEY_ISSUANCE_MANAGER_ADDRESS]: '0x2',
        [constants.state.STATE_KEY_IDENTITY_FILE]: '/usr/src/app/private-key',
        [constants.state.STATE_KEY_CHALLENGE_PERIOD]: 10,
        [constants.state.STATE_KEY_TX_TIMEOUT]: 10000,
      })
    })

    it('Should reject there is an error populating the state', async () => {
      const config = {
        [schemas.constants.SCHEMA_DB_KEY]: {
          [schemas.constants.SCHEMA_URL_KEY]: 'url',
        },
      }
      jest
        .spyOn(db, 'getCollection')
        .mockRejectedValue(new Error('getCollection error'))
      const state = {}
      try {
        await getInitialStateFromConfiguration(config, state)
        assert.fail()
      } catch (err) {
        assert.equal(err.message, 'getCollection error')
      }
    })
  })
})
