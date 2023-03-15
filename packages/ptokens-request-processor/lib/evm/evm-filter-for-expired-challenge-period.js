const schemas = require('ptokens-schemas')
const { isNil, curry, assoc } = require('ramda')
const { logger } = require('../get-logger')
const { STATE_PROPOSED_DB_REPORTS_KEY } = require('../state/constants')

const checkForExpiredChallengePeriod = curry(
  (_challengePeriod, _eventReport) => {
    const proposedTimestamp =
      _eventReport[schemas.db.collections.SCHEMA_PROPOSAL_TS_KEY]

    if (isNil(proposedTimestamp)) {
      logger.warn(
        'Anomaly detected: proposed report w/ Nil timestamp',
        JSON.stringify(_eventReport)
      )
      return false
    }

    const now = new Date().getTime() / 1000
    const challengePeriodInSeconds = _challengePeriod * 60
    return now > proposedTimestamp + challengePeriodInSeconds
  }
)

const filterForExpiredChallengePeriodAndPutInState = _state =>
  new Promise((resolve, reject) => {
    const challengePeriod = _state[schemas.constants.SCHEMA_CHALLENGE_PERIOD]
    const proposedEvents = _state[STATE_PROPOSED_DB_REPORTS_KEY]

    if (isNil(challengePeriod)) {
      return reject(
        new Error(
          `Missing configurable '${schemas.constants.SCHEMA_CHALLENGE_PERIOD}' (${challengePeriod})`
        )
      )
    }

    return Promise.resolve(
      proposedEvents.filter(checkForExpiredChallengePeriod)
    )
      .then(_filteredReports =>
        assoc(STATE_PROPOSED_DB_REPORTS_KEY, _filteredReports, _state)
      )
      .then(resolve)
  })

module.exports = {
  filterForExpiredChallengePeriodAndPutInState,
}
