const R = require('ramda')
const { db } = require('ptokens-utils')
const { logger } = require('./get-logger')
const { ID_ACTORS_PROPAGATED } = require('./constants')

module.exports.updateActorsPropagatedEventInStorage = R.curry(
  (_storage, _event) =>
    db.updateReportById(_storage, { $set: _event }, ID_ACTORS_PROPAGATED) ||
    logger.info(`Actors for epoch ${_event.currentEpoch} inserted in memory!`)
)
