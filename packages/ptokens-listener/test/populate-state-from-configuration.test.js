const assert = require('assert')
const { db } = require('ptokens-utils')
const { getInitialStateFromConfiguration } = require('../lib/populate-state-from-configuration')
const stateConstants = require('../lib/state/constants')
const constants = require('ptokens-constants')
const schemas = require('ptokens-schemas')

describe('State utilities tests', () => {
  describe('getInitialStateFromConfiguration', () => {
    it('Should populate the state from the configuration', async () => {
      const config = {
        [schemas.constants.configurationFields.SCHEMA_DB_KEY]: {
          [schemas.constants.configurationFields.SCHEMA_URL_KEY]: 'a-url',
          [schemas.constants.configurationFields.SCHEMA_NAME_KEY]: 'a-database-name',
          [schemas.constants.configurationFields.SCHEMA_TABLE_EVENTS_KEY]: 'a-collection-name',
        },
        [schemas.constants.configurationFields.SCHEMA_NETWORK_ID_KEY]: '0x00112233',
        [schemas.constants.configurationFields.SCHEMA_EVENTS_KEY]: [
          {
            [schemas.constants.configurationFields.SCHEMA_NAME_KEY]: 'redeem',
            [schemas.constants.configurationFields.SCHEMA_CONTRACTS_KEY]: [
              'btc.ptokens',
              'ltc.ptokens',
            ],
          },
          {
            [schemas.constants.configurationFields.SCHEMA_NAME_KEY]: 'pegin',
            [schemas.constants.configurationFields.SCHEMA_CONTRACTS_KEY]: ['xbsc.ptokens'],
          },
        ],
        [schemas.constants.configurationFields.SCHEMA_PROVIDER_URL_KEY]: 'provider-url',
      }
      jest
        .spyOn(db, 'getCollection')
        .mockImplementation((_url, _dbName, _collectionName) =>
          Promise.resolve(`${_url}/${_dbName}/${_collectionName}`)
        )
      const state = {}
      const ret = await getInitialStateFromConfiguration(config, state)
      assert.deepStrictEqual(ret, {
        [constants.state.STATE_KEY_DB]: 'a-url/a-database-name/a-collection-name',
        [constants.state.STATE_KEY_NETWORK_ID]: '0x00112233',
        [stateConstants.STATE_KEY_EVENTS]: [
          {
            [schemas.constants.configurationFields.SCHEMA_NAME_KEY]: 'redeem',
            [schemas.constants.configurationFields.SCHEMA_CONTRACTS_KEY]: [
              'btc.ptokens',
              'ltc.ptokens',
            ],
          },
          {
            [schemas.constants.configurationFields.SCHEMA_NAME_KEY]: 'pegin',
            [schemas.constants.configurationFields.SCHEMA_CONTRACTS_KEY]: ['xbsc.ptokens'],
          },
        ],
        [constants.state.STATE_KEY_PROVIDER_URL]: 'provider-url',
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
