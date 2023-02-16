const assert = require('assert')
const { db } = require('ptokens-utils')
const configurationUtils = require('../lib/configuration')

describe('State utilities tests', () => {
  describe('populateStateFromConfiguration', () => {
    it('Should populate the state from the configuration', async () => {
      const config = {
        db: {
          url: 'a-url',
          'database-name': 'a-database-name',
          'collection-name': 'a-collection-name',
        },
        'chain-id': '0x00112233',
        events: [
          {
            name: 'redeem',
            'account-names': ['btc.ptokens', 'ltc.ptokens'],
          },
          {
            name: 'pegin',
            'account-names': ['xbsc.ptokens'],
          },
        ],
      }
      jest
        .spyOn(db, 'getCollection')
        .mockImplementation((_url, _dbName, _collectionName) =>
          Promise.resolve(`${_url}/${_dbName}/${_collectionName}`)
        )
      const state = {}
      const ret = await configurationUtils.populateStateFromConfiguration(
        config,
        state
      )
      assert.deepStrictEqual(ret, {
        database: 'a-url/a-database-name/a-collection-name',
        'chain-id': '0x00112233',
        eventsToListen: [
          {
            name: 'redeem',
            'account-names': ['btc.ptokens', 'ltc.ptokens'],
          },
          {
            name: 'pegin',
            'account-names': ['xbsc.ptokens'],
          },
        ],
      })
    })

    it('Should reject there is an error populating the state', async () => {
      const config = {
        db: {
          url: 'url',
        },
      }
      jest
        .spyOn(db, 'getCollection')
        .mockRejectedValue(new Error('getCollection error'))
      const state = {}
      try {
        await configurationUtils.populateStateFromConfiguration(config, state)
        assert.fail()
      } catch (err) {
        assert.equal(err.message, 'getCollection error')
      }
    })
  })
})
