const R = require('ramda')
const { constants, db } = require('ptokens-utils')
const { STATE_KEY_EVENTS } = require('./state/constants')
const schemas = require('ptokens-schemas')

const getDbAndPutInState = R.curry((_config, _state) =>
  db
    .getCollection(
      _config[schemas.constants.SCHEMA_DB_KEY][
        schemas.constants.SCHEMA_URL_KEY
      ],
      _config[schemas.constants.SCHEMA_DB_KEY][
        schemas.constants.SCHEMA_NAME_KEY
      ],
      _config[schemas.constants.SCHEMA_DB_KEY][
        schemas.constants.SCHEMA_TABLE_EVENTS_KEY
      ]
    )
    .then(_collection => R.assoc(constants.STATE_KEY_DB, _collection, _state))
)

const getEventFromConfigurationAndPutInState = R.curry((_config, _state) =>
  R.assoc(
    STATE_KEY_EVENTS,
    _config[schemas.constants.SCHEMA_EVENTS_KEY],
    _state
  )
)

const getChainIdFromConfigurationAndPutInState = R.curry((_config, _state) =>
  R.assoc(
    constants.STATE_KEY_CHAIN_ID,
    _config[schemas.constants.SCHEMA_CHAIN_ID_KEY],
    _state
  )
)

const getProviderUrlFromConfigurationAndPutInState = R.curry(
  (_config, _state) =>
    R.assoc(
      constants.STATE_KEY_PROVIDER_URL,
      _config[schemas.constants.SCHEMA_PROVIDER_URL_KEY],
      _state
    )
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