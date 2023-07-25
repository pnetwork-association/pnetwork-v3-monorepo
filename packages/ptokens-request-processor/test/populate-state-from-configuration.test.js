const assert = require('assert')
const { db, validation } = require('ptokens-utils')
const {
  DEFAULT_TX_TIMEOUT,
  DEFAULT_LOOP_SLEEP_TIME,
  getInitialStateFromConfiguration,
} = require('../lib/populate-state-from-configuration')
const constants = require('ptokens-constants')

describe('State utilities tests', () => {
  describe('getInitialStateFromConfiguration', () => {
    it('Should populate the state from the configuration', async () => {
      const config = {
        [constants.config.KEY_CHAIN_NAME]: 'Ethereum Mainnet',
        [constants.config.KEY_CHAIN_TYPE]: 'EVM',
        [constants.config.KEY_NETWORK_ID]: '0x005fe7f9',
        [constants.config.KEY_DB]: {
          [constants.config.KEY_URL]: 'a-url',
          [constants.config.KEY_NAME]: 'a-database-name',
          [constants.config.KEY_TABLE_EVENTS]: 'a-collection-name',
        },
        [constants.config.KEY_PROVIDER_URL]: 'a-provider-url',
        [constants.config.KEY_HUB_ADDRESS]: '0x1',
        [constants.config.KEY_IDENTITY_GPG]: '/usr/src/app/private-key',
        [constants.config.KEY_CHALLENGE_PERIOD]: 10,
      }
      expect(
        await validation.validateJson(constants.config.schemas.requestProcessor, config)
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
        [constants.state.KEY_HUB_ADDRESS]: '0x1',
        [constants.state.KEY_IDENTITY_FILE]: '/usr/src/app/private-key',
        [constants.state.KEY_CHALLENGE_PERIOD]: 10,
        [constants.state.KEY_LOOP_SLEEP_TIME]: DEFAULT_LOOP_SLEEP_TIME,
        [constants.state.KEY_TX_TIMEOUT]: DEFAULT_TX_TIMEOUT,
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
