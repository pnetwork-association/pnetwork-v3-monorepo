const { db, constants } = require('ptokens-utils')
const { curry, assoc } = require('ramda')
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

const getInitialStateFromConfiguration = _config =>
  getDbAndPutInState(_config, {}).then(_state => ({
    ..._config,
    ..._state,
  }))

module.exports = {
  getInitialStateFromConfiguration,
}
