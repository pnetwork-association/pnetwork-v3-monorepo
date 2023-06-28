const constants = require('ptokens-constants')
const { db, utils } = require('ptokens-utils')
const R = require('ramda')

const getDbAndPutInState = R.curry((_config, _state) => {
  const url = _config[constants.config.KEY_DB][constants.config.KEY_URL]
  const dbName = _config[constants.config.KEY_DB][constants.config.KEY_NAME]
  const tableName = _config[constants.config.KEY_DB][constants.config.KEY_TABLE_EVENTS]

  return db
    .getCollection(url, dbName, tableName)
    .then(_collection => R.assoc(constants.state.KEY_DB, _collection, _state))
})

const getConfigPropertyAndPutInState = R.curry((_config, _configKey, _stateKey, _default, _state) =>
  R.assoc(_stateKey, utils.isNotNil(_config[_configKey]) ? _config[_configKey] : _default, _state)
)

const DEFAULT_TX_TIMEOUT = 10000 // 10s
const DEFAULT_LOOP_SLEEP_TIME = 3000 // 1s

const getInitialStateFromConfiguration = _config =>
  getDbAndPutInState(_config, {})
    .then(
      getConfigPropertyAndPutInState(
        _config,
        constants.config.KEY_NETWORK_ID,
        constants.state.KEY_NETWORK_ID,
        null
      )
    )
    .then(
      getConfigPropertyAndPutInState(
        _config,
        constants.config.KEY_PROVIDER_URL,
        constants.state.KEY_PROVIDER_URL,
        null
      )
    )
    .then(
      getConfigPropertyAndPutInState(
        _config,
        constants.config.KEY_STATE_MANAGER,
        constants.state.KEY_STATE_MANAGER_ADDRESS,
        null
      )
    )
    .then(
      getConfigPropertyAndPutInState(
        _config,
        constants.config.KEY_IDENTITY_GPG,
        constants.state.KEY_IDENTITY_FILE,
        null
      )
    )
    .then(
      getConfigPropertyAndPutInState(
        _config,
        constants.config.KEY_CHALLENGE_PERIOD,
        constants.state.KEY_CHALLENGE_PERIOD,
        null
      )
    )
    .then(
      getConfigPropertyAndPutInState(
        _config,
        constants.config.KEY_TX_TIMEOUT,
        constants.state.KEY_TX_TIMEOUT,
        DEFAULT_TX_TIMEOUT
      )
    )
    .then(
      getConfigPropertyAndPutInState(
        _config,
        constants.config.KEY_LOOP_SLEEP_TIME,
        constants.state.KEY_LOOP_SLEEP_TIME,
        DEFAULT_LOOP_SLEEP_TIME
      )
    )

module.exports = {
  DEFAULT_TX_TIMEOUT,
  DEFAULT_LOOP_SLEEP_TIME,
  getInitialStateFromConfiguration,
}
