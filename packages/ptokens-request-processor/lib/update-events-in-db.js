const {
  STATE_PROPOSED_DB_REPORTS,
  STATE_FINALIZED_DB_REPORTS,
  STATE_DISMISSED_DB_REPORTS,
} = require('./state/constants')
const { db } = require('ptokens-utils')
const R = require('ramda')
const { logger } = require('./get-logger')

const constants = require('ptokens-constants')

const updateEventInDb = R.curry(
  (_table, _eventReport) =>
    new Promise(resolve => {
      const id = _eventReport[constants.db.KEY_ID]
      // Should update just the new fields
      const update = { $set: _eventReport }
      if (R.isNil(_eventReport[constants.db.KEY_ERROR])) {
        update['$unset'] = { [constants.db.KEY_ERROR]: '' }
      }
      logger.debug(`Updating report ${id}`)

      return db.updateReportById(_table, update, id).then(resolve)
    })
)

const updateEventsInDb = (_table, _events) =>
  logger.info('Updating events into database...') ||
  Promise.all(_events.map(updateEventInDb(_table))).then(
    _ => logger.info(`Updated ${R.length(_events)} events!`) || Promise.resolve()
  )

const maybeUpdateEventsInDb = R.curry(
  (_eventsStateKey, _state) =>
    new Promise(resolve => {
      const eventsTable = _state[constants.state.KEY_DB]
      const events = _state[_eventsStateKey] || []
      const eventsLength = R.length(events)

      return eventsLength === 0
        ? logger.info(`No entries in '${_eventsStateKey}' in state, skipping db update...`) ||
            resolve(_state)
        : updateEventsInDb(eventsTable, events).then(_ => resolve(_state))
    })
)

const maybeUpdateProposedEventsInDb = maybeUpdateEventsInDb(STATE_PROPOSED_DB_REPORTS)

const maybeUpdateFinalizedEventsInDb = maybeUpdateEventsInDb(STATE_FINALIZED_DB_REPORTS)

const maybeUpdateDismissedEventsInDb = maybeUpdateEventsInDb(STATE_DISMISSED_DB_REPORTS)

module.exports = {
  updateEventInDb,
  maybeUpdateProposedEventsInDb,
  maybeUpdateFinalizedEventsInDb,
  maybeUpdateDismissedEventsInDb,
}
