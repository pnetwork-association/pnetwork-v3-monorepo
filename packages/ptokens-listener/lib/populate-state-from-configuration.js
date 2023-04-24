const R = require('ramda')
const constants = require('ptokens-constants')
const { db } = require('ptokens-utils')
const { STATE_KEY_EVENTS } = require('./state/constants')

const getDbAndPutInState = R.curry((_config, _state) =>
  db
    .getCollection(
      _config[constants.config.KEY_DB][constants.config.KEY_URL],
      _config[constants.config.KEY_DB][constants.config.KEY_NAME],
      _config[constants.config.KEY_DB][constants.config.KEY_TABLE_EVENTS]
    )
    .then(_collection => R.assoc(constants.state.KEY_DB, _collection, _state))
)

const getEventFromConfigurationAndPutInState = R.curry((_config, _state) =>
  R.assoc(STATE_KEY_EVENTS, _config[constants.config.KEY_EVENTS], _state)
)

const getNetworkIdFromConfigurationAndPutInState = R.curry((_config, _state) =>
  R.assoc(constants.state.KEY_NETWORK_ID, _config[constants.config.KEY_NETWORK_ID], _state)
)

const getProviderUrlFromConfigurationAndPutInState = R.curry((_config, _state) =>
  R.assoc(constants.state.KEY_PROVIDER_URL, _config[constants.config.KEY_PROVIDER_URL], _state)
)

const getInitialStateFromConfiguration = _config =>
  Promise.resolve({})
    .then(getDbAndPutInState(_config))
    .then(getEventFromConfigurationAndPutInState(_config))
    .then(getNetworkIdFromConfigurationAndPutInState(_config))
    .then(getProviderUrlFromConfigurationAndPutInState(_config))

module.exports = {
  getInitialStateFromConfiguration,
}
