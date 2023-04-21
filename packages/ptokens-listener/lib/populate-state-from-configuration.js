const R = require('ramda')
const constants = require('ptokens-constants')
const { db } = require('ptokens-utils')
const { STATE_KEY_EVENTS } = require('./state/constants')
const schemas = require('ptokens-schemas')

const getDbAndPutInState = R.curry((_config, _state) =>
  db
    .getCollection(
      _config[schemas.constants.configurationFields.SCHEMA_DB_KEY][
        schemas.constants.configurationFields.SCHEMA_URL_KEY
      ],
      _config[schemas.constants.configurationFields.SCHEMA_DB_KEY][
        schemas.constants.configurationFields.SCHEMA_NAME_KEY
      ],
      _config[schemas.constants.configurationFields.SCHEMA_DB_KEY][
        schemas.constants.configurationFields.SCHEMA_TABLE_EVENTS_KEY
      ]
    )
    .then(_collection => R.assoc(constants.state.STATE_KEY_DB, _collection, _state))
)

const getEventFromConfigurationAndPutInState = R.curry((_config, _state) =>
  R.assoc(
    STATE_KEY_EVENTS,
    _config[schemas.constants.configurationFields.SCHEMA_EVENTS_KEY],
    _state
  )
)

const getNetworkIdFromConfigurationAndPutInState = R.curry((_config, _state) =>
  R.assoc(
    constants.state.STATE_KEY_NETWORK_ID,
    _config[schemas.constants.configurationFields.SCHEMA_NETWORK_ID_KEY],
    _state
  )
)

const getProviderUrlFromConfigurationAndPutInState = R.curry((_config, _state) =>
  R.assoc(
    constants.state.STATE_KEY_PROVIDER_URL,
    _config[schemas.constants.configurationFields.SCHEMA_PROVIDER_URL_KEY],
    _state
  )
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
