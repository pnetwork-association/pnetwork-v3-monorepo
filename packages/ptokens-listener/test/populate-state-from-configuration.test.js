const assert = require('assert')
const { db } = require('ptokens-utils')
const {
  getInitialStateFromConfiguration,
} = require('../lib/populate-state-from-configuration')
const stateConstants = require('../lib/state/constants')
const { constants: ptokensUtilsConstants } = require('ptokens-utils')
const schemas = require('ptokens-schemas')

describe('State utilities tests', () => {
  describe('getInitialStateFromConfiguration', () => {
    it('Should populate the state from the configuration', async () => {
      const config = {
        [schemas.constants.SCHEMA_DB_KEY]: {
          [schemas.constants.SCHEMA_URL_KEY]: 'a-url',
          [schemas.constants.SCHEMA_NAME_KEY]: 'a-database-name',
          [schemas.constants.SCHEMA_TABLE_EVENTS_KEY]: 'a-collection-name',
        },
        [schemas.constants.SCHEMA_CHAIN_ID_KEY]: '0x00112233',
        [schemas.constants.SCHEMA_EVENTS_KEY]: [
          {
            [schemas.constants.SCHEMA_NAME_KEY]: 'redeem',
            [schemas.constants.SCHEMA_TOKEN_CONTRACTS_KEY]: [
              'btc.ptokens',
              'ltc.ptokens',
            ],
          },
          {
            [schemas.constants.SCHEMA_NAME_KEY]: 'pegin',
            [schemas.constants.SCHEMA_TOKEN_CONTRACTS_KEY]: ['xbsc.ptokens'],
          },
        ],
        [schemas.constants.SCHEMA_PROVIDER_URL_KEY]: 'provider-url',
      }
      jest
        .spyOn(db, 'getCollection')
        .mockImplementation((_url, _dbName, _collectionName) =>
          Promise.resolve(`${_url}/${_dbName}/${_collectionName}`)
        )
      const state = {}
      const ret = await getInitialStateFromConfiguration(config, state)
      assert.deepStrictEqual(ret, {
        [ptokensUtilsConstants.STATE_KEY_DB]:
          'a-url/a-database-name/a-collection-name',
        [ptokensUtilsConstants.STATE_KEY_CHAIN_ID]: '0x00112233',
        [stateConstants.STATE_KEY_EVENTS]: [
          {
            [schemas.constants.SCHEMA_NAME_KEY]: 'redeem',
            [schemas.constants.SCHEMA_TOKEN_CONTRACTS_KEY]: [
              'btc.ptokens',
              'ltc.ptokens',
            ],
          },
          {
            [schemas.constants.SCHEMA_NAME_KEY]: 'pegin',
            [schemas.constants.SCHEMA_TOKEN_CONTRACTS_KEY]: ['xbsc.ptokens'],
          },
        ],
        [ptokensUtilsConstants.STATE_KEY_PROVIDER_URL]: 'provider-url',
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
