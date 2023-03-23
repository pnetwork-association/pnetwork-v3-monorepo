const schemas = require('ptokens-schemas')
const { utils } = require('ptokens-utils')
const { logger } = require('../get-logger')
const { prop, isNil, curry, assoc, length } = require('ramda')
const { STATE_PROPOSED_DB_REPORTS_KEY } = require('../state/constants')

const ERROR_INVALID_PROPOSED_TIMESTAMP = 'Invalid proposed timestamp!'

const getExpirationDate = curry(
  (_challengePeriod, _proposedEventTimestamp) =>
    new Promise((resolve, reject) =>
      utils.isNotNil(_proposedEventTimestamp)
        ? resolve(
            utils.date.addMinutesToDate(
              _challengePeriod,
              new Date(_proposedEventTimestamp)
            )
          )
        : reject(ERROR_INVALID_PROPOSED_TIMESTAMP)
    )
)

const getEventProposedTimestamp = _event =>
  Promise.resolve(prop(schemas.constants.SCHEMA_PROPOSAL_TS_KEY, _event))

const isChallengePeriodExpired = curry((_challengePeriod, _proposedEvent) =>
  getEventProposedTimestamp(_proposedEvent)
    .then(getExpirationDate(_challengePeriod))
    .then(_expirationDate => {
      const now = new Date()
      const slicedOriginTx = _proposedEvent[
        schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY
      ].slice(0, 10)
      logger.debug(
        '%s: %s > %s => %s',
        slicedOriginTx,
        now,
        _expirationDate,
        now > _expirationDate
      )
      return now > _expirationDate ? _proposedEvent : null
    })
    .catch(_err =>
      _err.message === ERROR_INVALID_PROPOSED_TIMESTAMP
        ? // FIXME: use schemas to access key _id
          logger.warn(
            `Anomaly: detected ${_proposedEvent['_id']} with timestamp is Nil, skipping...`
          ) || Promise.resolve(null)
        : Promise.reject(_err)
    )
)

const keepExpiredProposedEvents = curry(
  (_challengePeriod, _proposedEvents) =>
    logger.info(
      `Checking ${length(_proposedEvents)} events for expiration...`
    ) ||
    Promise.all(
      _proposedEvents.map(isChallengePeriodExpired(_challengePeriod))
    ).then(utils.removeNilsFromList)
)

const filterForExpiredProposalsAndPutThemInState = _state =>
  new Promise((resolve, reject) => {
    const challengePeriod = _state[schemas.constants.SCHEMA_CHALLENGE_PERIOD]
    const proposedEvents = _state[STATE_PROPOSED_DB_REPORTS_KEY] || []

    if (isNil(challengePeriod)) {
      return reject(
        new Error(
          `Invalid value for '${schemas.constants.SCHEMA_CHALLENGE_PERIOD}': ${challengePeriod}`
        )
      )
    }

    return keepExpiredProposedEvents(challengePeriod, proposedEvents)
      .then(
        _filteredReports =>
          logger.info(`Found ${length(_filteredReports)} expired events...`) ||
          assoc(STATE_PROPOSED_DB_REPORTS_KEY, _filteredReports, _state)
      )
      .then(resolve)
  })

const maybefilterForExpiredProposalsAndPutThemInState = _state => {
  logger.info('Maybe filter for expired proposals...')
  const proposedEvents = _state[STATE_PROPOSED_DB_REPORTS_KEY] || []
  const proposedEventsLength = length(proposedEvents)

  return proposedEventsLength === 0
    ? logger.info(
        'No proposed events so far, skipping challenge period filtering...'
      ) || Promise.resolve(_state)
    : filterForExpiredProposalsAndPutThemInState(_state)
}

module.exports = {
  maybefilterForExpiredProposalsAndPutThemInState,
}
