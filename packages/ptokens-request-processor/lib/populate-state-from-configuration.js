const constants = require('ptokens-constants')
const { db, utils } = require('ptokens-utils')
const R = require('ramda')
const schemas = require('ptokens-schemas')

const getDbAndPutInState = R.curry((_config, _state) => {
  const url =
    _config[schemas.constants.SCHEMA_DB_KEY][schemas.constants.SCHEMA_URL_KEY]
  const dbName =
    _config[schemas.constants.SCHEMA_DB_KEY][schemas.constants.SCHEMA_NAME_KEY]
  const tableName =
    _config[schemas.constants.SCHEMA_DB_KEY][
      schemas.constants.SCHEMA_TABLE_EVENTS_KEY
    ]

  return db
    .getCollection(url, dbName, tableName)
    .then(_collection =>
      R.assoc(constants.state.STATE_KEY_DB, _collection, _state)
    )
})

const getConfigPropertyAndPutInState = R.curry(
  (_config, _configKey, _stateKey, _default, _state) =>
    R.assoc(
      _stateKey,
      utils.isNotNil(_config[_configKey]) ? _config[_configKey] : _default,
      _state
    )
)

const DEFAULT_TX_TIMEOUT = 10000 // 10s
const DEFAULT_LOOP_SLEEP_TIME = 1000 // 1s

const getInitialStateFromConfiguration = _config =>
  getDbAndPutInState(_config, {})
    .then(
      getConfigPropertyAndPutInState(
        _config,
        schemas.constants.SCHEMA_CHAIN_ID_KEY,
        constants.state.STATE_KEY_CHAIN_ID,
        null
      )
    )
    .then(
      getConfigPropertyAndPutInState(
        _config,
        schemas.constants.SCHEMA_PROVIDER_URL_KEY,
        constants.state.STATE_KEY_PROVIDER_URL,
        null
      )
    )
    .then(
      getConfigPropertyAndPutInState(
        _config,
        schemas.constants.SCHEMA_STATE_MANAGER_KEY,
        constants.state.STATE_KEY_STATE_MANAGER_ADDRESS,
        null
      )
    )
    .then(
      getConfigPropertyAndPutInState(
        _config,
        schemas.constants.SCHEMA_IDENTITY_GPG_KEY,
        constants.state.STATE_KEY_IDENTITY_FILE,
        null
      )
    )
    .then(
      getConfigPropertyAndPutInState(
        _config,
        schemas.constants.SCHEMA_CHALLENGE_PERIOD,
        constants.state.STATE_KEY_CHALLENGE_PERIOD,
        null
      )
    )
    .then(
      getConfigPropertyAndPutInState(
        _config,
        schemas.constants.SCHEMA_TX_TIMEOUT,
        constants.state.STATE_KEY_TX_TIMEOUT,
        DEFAULT_TX_TIMEOUT
      )
    )
    .then(
      getConfigPropertyAndPutInState(
        _config,
        schemas.constants.SCHEMA_LOOP_SLEEP_TIME,
        constants.state.STATE_KEY_LOOP_SLEEP_TIME,
        DEFAULT_LOOP_SLEEP_TIME
      )
    )

module.exports = {
  DEFAULT_TX_TIMEOUT,
  DEFAULT_LOOP_SLEEP_TIME,
  getInitialStateFromConfiguration,
}
