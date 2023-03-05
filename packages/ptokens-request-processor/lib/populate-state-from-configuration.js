const { db, constants } = require('ptokens-utils')
const { curry, assoc } = require('ramda')
const { constants: schemasConstants } = require('ptokens-schemas')

const getDbAndPutInState = curry((_config, _state) => {
  const url =
    _config[schemasConstants.SCHEMA_DB_KEY][schemasConstants.SCHEMA_URL_KEY]
  const dbName =
    _config[schemasConstants.SCHEMA_DB_KEY][schemasConstants.SCHEMA_NAME_KEY]
  const tableName =
    _config[schemasConstants.SCHEMA_DB_KEY][
      schemasConstants.SCHEMA_TABLE_EVENTS_KEY
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
