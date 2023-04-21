const assert = require('assert')
const { db } = require('ptokens-utils')
const { getInitialStateFromConfiguration } = require('../lib/populate-state-from-configuration')
const stateConstants = require('../lib/state/constants')
const constants = require('ptokens-constants')

describe('State utilities tests', () => {
  describe('getInitialStateFromConfiguration', () => {
    it('Should populate the state from the configuration', async () => {
      const config = {
        [constants.config.KEY_DB]: {
          [constants.config.KEY_URL]: 'a-url',
          [constants.config.KEY_NAME]: 'a-database-name',
          [constants.config.KEY_TABLE_EVENTS]: 'a-collection-name',
        },
        [constants.config.KEY_NETWORK_ID]: '0x00112233',
        [constants.config.KEY_EVENTS]: [
          {
            [constants.config.KEY_NAME]: 'redeem',
            [constants.config.KEY_CONTRACTS]: ['btc.ptokens', 'ltc.ptokens'],
          },
          {
            [constants.config.KEY_NAME]: 'pegin',
            [constants.config.KEY_CONTRACTS]: ['xbsc.ptokens'],
          },
        ],
        [constants.config.KEY_PROVIDER_URL]: 'provider-url',
      }
      jest
        .spyOn(db, 'getCollection')
        .mockImplementation((_url, _dbName, _collectionName) =>
          Promise.resolve(`${_url}/${_dbName}/${_collectionName}`)
        )
      const state = {}
      const ret = await getInitialStateFromConfiguration(config, state)
      assert.deepStrictEqual(ret, {
        [constants.state.KEY_DB]: 'a-url/a-database-name/a-collection-name',
        [constants.state.KEY_NETWORK_ID]: '0x00112233',
        [stateConstants.STATE_KEY_EVENTS]: [
          {
            [constants.config.KEY_NAME]: 'redeem',
            [constants.config.KEY_CONTRACTS]: ['btc.ptokens', 'ltc.ptokens'],
          },
          {
            [constants.config.KEY_NAME]: 'pegin',
            [constants.config.KEY_CONTRACTS]: ['xbsc.ptokens'],
          },
        ],
        [constants.state.KEY_PROVIDER_URL]: 'provider-url',
      })
    })

    it('Should reject there is an error populating the state', async () => {
      const config = {
        [constants.config.KEY_DB]: {
          [constants.config.KEY_URL]: 'url',
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
