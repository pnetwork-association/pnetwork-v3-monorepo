const assert = require('assert')
const { db } = require('ptokens-utils')
const {
  getInitialStateFromConfiguration,
} = require('../lib/populate-state-from-configuration')

describe('State utilities tests', () => {
  describe('getInitialStateFromConfiguration', () => {
    it('Should populate the state from the configuration', async () => {
      const config = {
        db: {
          url: 'a-url',
          name: 'a-database-name',
          'table-events': 'a-collection-name',
        },
        'chain-id': '0x00112233',
        events: [
          {
            name: 'redeem',
            'token-contracts': ['btc.ptokens', 'ltc.ptokens'],
          },
          {
            name: 'pegin',
            'token-contracts': ['xbsc.ptokens'],
          },
        ],
        'provider-url': 'provider-url',
      }
      jest
        .spyOn(db, 'getCollection')
        .mockImplementation((_url, _dbName, _collectionName) =>
          Promise.resolve(`${_url}/${_dbName}/${_collectionName}`)
        )
      const state = {}
      const ret = await getInitialStateFromConfiguration(config, state)
      assert.deepStrictEqual(ret, {
        database: 'a-url/a-database-name/a-collection-name',
        'chain-id': '0x00112233',
        eventsToListen: [
          {
            name: 'redeem',
            'token-contracts': ['btc.ptokens', 'ltc.ptokens'],
          },
          {
            name: 'pegin',
            'token-contracts': ['xbsc.ptokens'],
          },
        ],
        'provider-url': 'provider-url',
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
        await getInitialStateFromConfiguration(config, state)
        assert.fail()
      } catch (err) {
        assert.equal(err.message, 'getCollection error')
      }
    })
  })
})
