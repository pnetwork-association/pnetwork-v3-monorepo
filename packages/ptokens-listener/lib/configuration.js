const R = require('ramda')
const { constants, db } = require('ptokens-utils')
const config = require('../config')

const getConfiguration = () => config

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
  R.assoc('eventsToListen', _config.events, _state)
)

const getChainIdFromConfigurationAndPutInState = R.curry((_config, _state) =>
  R.assoc('chain-id', _config['chain-id'], _state)
)

const populateStateFromConfiguration = _config =>
  Promise.resolve({})
    .then(getDbAndPutInState(_config))
    .then(getEventFromConfigurationAndPutInState(_config))
    .then(getChainIdFromConfigurationAndPutInState(_config))

module.exports = {
  getConfiguration,
  populateStateFromConfiguration,
}
