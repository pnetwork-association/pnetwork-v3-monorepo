const R = require('ramda')
const { logger } = require('./get-logger')
const constants = require('ptokens-constants')
const { db } = require('ptokens-utils')

const {
  MEM_ACTORS,
  MEM_ACTORS_PROPAGATED,
  MEM_CHALLENGES,
  STATE_DB_ACTORS_KEY,
  STATE_DB_CHALLENGES_KEY,
  STATE_DB_ACTORS_PROPAGATED_KEY,
} = require('./constants')

module.exports.addRequiredStorageToState = _state =>
  new Promise((resolve, reject) => {
    const dbConfig = _state[constants.config.KEY_DB]
    const dbUrl = dbConfig[constants.config.KEY_URL]
    const dbName = dbConfig[constants.config.KEY_NAME]

    return Promise.all([
      db.getCollection(dbUrl, dbName, MEM_ACTORS),
      db.getCollection(dbUrl, dbName, MEM_CHALLENGES),
      db.getCollection(dbUrl, dbName, MEM_ACTORS_PROPAGATED),
    ])
      .then(
        R.zipObj([STATE_DB_ACTORS_KEY, STATE_DB_CHALLENGES_KEY, STATE_DB_ACTORS_PROPAGATED_KEY])
      )
      .then(R.mergeWith(R.concat, _state))
      .then(_newState => logger.info('Required storage set!') || resolve(_newState))
      .catch(reject)
  })
