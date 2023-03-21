const { db, constants } = require('ptokens-utils')
const { curry, assoc, mergeAll } = require('ramda')
const schemas = require('ptokens-schemas')

const getDbAndPutInState = curry((_config, _state) => {
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
    .then(_collection => assoc(constants.STATE_KEY_DB, _collection, _state))
})

// TODO: configurable
const DEFAULT_TX_TIMEOUT = 10000 // 10s
const maybeSetTxTimeoutToDefaultValue = _state =>
  assoc(
    schemas.constants.SCHEMA_TX_TIMEOUT,
    _state[schemas.constants.SCHEMA_TX_TIMEOUT] || DEFAULT_TX_TIMEOUT,
    _state
  )

const mergeConfigAndState = curry((_state, _config) =>
  mergeAll([_config, _state])
)

const getInitialStateFromConfiguration = _config =>
  getDbAndPutInState(_config, {})
    .then(mergeConfigAndState(_config))
    .then(maybeSetTxTimeoutToDefaultValue)

module.exports = {
  getInitialStateFromConfiguration,
}
