const assert = require('assert')
const { db, validation } = require('ptokens-utils')
const {
  DEFAULT_TX_TIMEOUT,
  DEFAULT_LOOP_SLEEP_TIME,
  getInitialStateFromConfiguration,
} = require('../lib/populate-state-from-configuration')
const constants = require('ptokens-constants')
const schemas = require('ptokens-schemas')

describe('State utilities tests', () => {
  describe('getInitialStateFromConfiguration', () => {
    it('Should populate the state from the configuration', async () => {
      const config = {
        [schemas.constants.configurationFields.SCHEMA_CHAIN_NAME_KEY]: 'Ethereum Mainnet',
        [schemas.constants.configurationFields.SCHEMA_CHAIN_TYPE_KEY]: 'EVM',
        [schemas.constants.configurationFields.SCHEMA_NETWORK_ID_KEY]: '0x005fe7f9',
        [schemas.constants.configurationFields.SCHEMA_DB_KEY]: {
          [schemas.constants.configurationFields.SCHEMA_URL_KEY]: 'a-url',
          [schemas.constants.configurationFields.SCHEMA_NAME_KEY]: 'a-database-name',
          [schemas.constants.configurationFields.SCHEMA_TABLE_EVENTS_KEY]: 'a-collection-name',
        },
        [schemas.constants.configurationFields.SCHEMA_PROVIDER_URL_KEY]: 'a-provider-url',
        [schemas.constants.configurationFields.SCHEMA_STATE_MANAGER_KEY]: '0x1',
        [schemas.constants.configurationFields.SCHEMA_IDENTITY_GPG_KEY]: '/usr/src/app/private-key',
        [schemas.constants.configurationFields.SCHEMA_CHALLENGE_PERIOD]: 10,
      }
      expect(
        await validation.validateJson(schemas.configurations.requestProcessor, config)
      ).toBeTruthy()
      jest
        .spyOn(db, 'getCollection')
        .mockImplementation((_url, _dbName, _collectionName) =>
          Promise.resolve(`${_url}/${_dbName}/${_collectionName}`)
        )
      const state = {}
      const ret = await getInitialStateFromConfiguration(config, state)
      assert.deepStrictEqual(ret, {
        [constants.state.KEY_DB]: 'a-url/a-database-name/a-collection-name',
        [constants.state.KEY_NETWORK_ID]: '0x005fe7f9',
        [constants.state.KEY_PROVIDER_URL]: 'a-provider-url',
        [constants.state.KEY_STATE_MANAGER_ADDRESS]: '0x1',
        [constants.state.KEY_IDENTITY_FILE]: '/usr/src/app/private-key',
        [constants.state.KEY_CHALLENGE_PERIOD]: 10,
        [constants.state.KEY_LOOP_SLEEP_TIME]: DEFAULT_LOOP_SLEEP_TIME,
        [constants.state.KEY_TX_TIMEOUT]: DEFAULT_TX_TIMEOUT,
      })
    })

    it('Should reject there is an error populating the state', async () => {
      const config = {
        [schemas.constants.configurationFields.SCHEMA_DB_KEY]: {
          [schemas.constants.configurationFields.SCHEMA_URL_KEY]: 'url',
        },
      }
      jest.spyOn(db, 'getCollection').mockRejectedValue(new Error('getCollection error'))
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
