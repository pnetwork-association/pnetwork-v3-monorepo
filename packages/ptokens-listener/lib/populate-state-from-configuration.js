const R = require('ramda')
const { constants, db } = require('ptokens-utils')
const {
  STATE_KEY_CHAIN_ID,
  STATE_KEY_EVENTS,
  STATE_KEY_PROVIDER_URL,
} = require('./state/constants')

const getDbAndPutInState = R.curry((_config, _state) =>
  db
    .getCollection(
      _config.db.url,
      _config.db['database-name'],
      _config.db['collection-name']
    )
    .then(_collection => R.assoc(constants.STATE_KEY_DB, _collection, _state))
)

const getEventFromConfigurationAndPutInState = R.curry((_config, _state) =>
  R.assoc(STATE_KEY_EVENTS, _config.events, _state)
)

const getChainIdFromConfigurationAndPutInState = R.curry((_config, _state) =>
  R.assoc(STATE_KEY_CHAIN_ID, _config['chain-id'], _state)
)

const getProviderUrlFromConfigurationAndPutInState = R.curry(
  (_config, _state) =>
    R.assoc(STATE_KEY_PROVIDER_URL, _config['provider-url'], _state)
)

const getInitialStateFromConfiguration = _config =>
  Promise.resolve({})
    .then(getDbAndPutInState(_config))
    .then(getEventFromConfigurationAndPutInState(_config))
    .then(getChainIdFromConfigurationAndPutInState(_config))
    .then(getProviderUrlFromConfigurationAndPutInState(_config))

module.exports = {
  getInitialStateFromConfiguration,
}
