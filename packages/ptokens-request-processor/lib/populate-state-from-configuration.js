const constants = require('ptokens-constants')
const { db, utils } = require('ptokens-utils')
const R = require('ramda')
const schemas = require('ptokens-schemas')

const getDbAndPutInState = R.curry((_config, _state) => {
  const url =
    _config[schemas.constants.configurationFields.SCHEMA_DB_KEY][
      schemas.constants.configurationFields.SCHEMA_URL_KEY
    ]
  const dbName =
    _config[schemas.constants.configurationFields.SCHEMA_DB_KEY][
      schemas.constants.configurationFields.SCHEMA_NAME_KEY
    ]
  const tableName =
    _config[schemas.constants.configurationFields.SCHEMA_DB_KEY][
      schemas.constants.configurationFields.SCHEMA_TABLE_EVENTS_KEY
    ]

  return db
    .getCollection(url, dbName, tableName)
    .then(_collection => R.assoc(constants.state.KEY_DB, _collection, _state))
})

const getConfigPropertyAndPutInState = R.curry((_config, _configKey, _stateKey, _default, _state) =>
  R.assoc(_stateKey, utils.isNotNil(_config[_configKey]) ? _config[_configKey] : _default, _state)
)

const DEFAULT_TX_TIMEOUT = 10000 // 10s
const DEFAULT_LOOP_SLEEP_TIME = 1000 // 1s

const getInitialStateFromConfiguration = _config =>
  getDbAndPutInState(_config, {})
    .then(
      getConfigPropertyAndPutInState(
        _config,
        schemas.constants.configurationFields.SCHEMA_NETWORK_ID_KEY,
        constants.state.KEY_NETWORK_ID,
        null
      )
    )
    .then(
      getConfigPropertyAndPutInState(
        _config,
        schemas.constants.configurationFields.SCHEMA_PROVIDER_URL_KEY,
        constants.state.KEY_PROVIDER_URL,
        null
      )
    )
    .then(
      getConfigPropertyAndPutInState(
        _config,
        schemas.constants.configurationFields.SCHEMA_STATE_MANAGER_KEY,
        constants.state.KEY_STATE_MANAGER_ADDRESS,
        null
      )
    )
    .then(
      getConfigPropertyAndPutInState(
        _config,
        schemas.constants.configurationFields.SCHEMA_IDENTITY_GPG_KEY,
        constants.state.KEY_IDENTITY_FILE,
        null
      )
    )
    .then(
      getConfigPropertyAndPutInState(
        _config,
        schemas.constants.configurationFields.SCHEMA_CHALLENGE_PERIOD,
        constants.state.KEY_CHALLENGE_PERIOD,
        null
      )
    )
    .then(
      getConfigPropertyAndPutInState(
        _config,
        schemas.constants.configurationFields.SCHEMA_TX_TIMEOUT,
        constants.state.KEY_TX_TIMEOUT,
        DEFAULT_TX_TIMEOUT
      )
    )
    .then(
      getConfigPropertyAndPutInState(
        _config,
        schemas.constants.configurationFields.SCHEMA_LOOP_SLEEP_TIME,
        constants.state.KEY_LOOP_SLEEP_TIME,
        DEFAULT_LOOP_SLEEP_TIME
      )
    )

module.exports = {
  DEFAULT_TX_TIMEOUT,
  DEFAULT_LOOP_SLEEP_TIME,
  getInitialStateFromConfiguration,
}
