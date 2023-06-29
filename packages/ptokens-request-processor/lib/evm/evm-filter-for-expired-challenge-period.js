const R = require('ramda')
const errors = require('../errors')
const constants = require('ptokens-constants')
const { utils } = require('ptokens-utils')
const { logger } = require('../get-logger')
const { STATE_PROPOSED_DB_REPORTS } = require('../state/constants')

const getExpirationDate = R.curry(
  (_challengePeriod, _proposedEventTimestamp) =>
    new Promise((resolve, reject) =>
      utils.isNotNil(_proposedEventTimestamp)
        ? resolve(utils.date.addMinutesToDate(_challengePeriod, new Date(_proposedEventTimestamp)))
        : reject(
            new Error(`${errors.ERROR_INVALID_PROPOSED_TIMESTAMP} '${_proposedEventTimestamp}'`)
          )
    )
)

const getEventProposedTimestamp = _event =>
  Promise.resolve(R.prop(constants.db.KEY_PROPOSAL_TS, _event))

const getCurrentDate = () => new Date()

const isChallengePeriodExpired = R.curry((_challengePeriod, _proposedEvent) =>
  getEventProposedTimestamp(_proposedEvent)
    .then(getExpirationDate(_challengePeriod))
    .then(_expirationDate => {
      const now = getCurrentDate()
      const slicedTxHash = _proposedEvent[constants.db.KEY_TX_HASH].slice(0, 10)
      logger.debug('%s: %s > %s => %s', slicedTxHash, now, _expirationDate, now > _expirationDate)
      return now > _expirationDate ? _proposedEvent : null
    })
    .catch(_err =>
      _err.message === errors.ERROR_INVALID_PROPOSED_TIMESTAMP
        ? // FIXME: use schemas to access key _id
          logger.warn(
            `Anomaly: detected ${_proposedEvent['_id']} with timestamp is Nil, skipping...`
          ) || Promise.resolve(null)
        : Promise.reject(_err)
    )
)

const keepExpiredProposedEvents = R.curry(
  (_challengePeriod, _proposedEvents) =>
    logger.info(`Checking ${R.length(_proposedEvents)} events for expiration...`) ||
    Promise.all(_proposedEvents.map(isChallengePeriodExpired(_challengePeriod))).then(
      utils.removeNilsFromList
    )
)

const filterForExpiredProposalsAndPutThemInState = _state =>
  new Promise((resolve, reject) => {
    const challengePeriod = _state[constants.state.KEY_CHALLENGE_PERIOD]
    const proposedEvents = _state[STATE_PROPOSED_DB_REPORTS] || []

    if (R.isNil(challengePeriod)) {
      return reject(
        new Error(`Invalid value for '${constants.state.KEY_CHALLENGE_PERIOD}': ${challengePeriod}`)
      )
    }

    return keepExpiredProposedEvents(challengePeriod, proposedEvents)
      .then(
        _filteredReports =>
          logger.info(`Found ${R.length(_filteredReports)} expired events...`) ||
          R.assoc(STATE_PROPOSED_DB_REPORTS, _filteredReports, _state)
      )
      .then(resolve)
  })

const maybefilterForExpiredProposalsAndPutThemInState = _state => {
  logger.info('Maybe filter for expired proposals...')
  const proposedEvents = _state[STATE_PROPOSED_DB_REPORTS] || []
  const proposedEventsLength = R.length(proposedEvents)

  return proposedEventsLength === 0
    ? logger.info('No proposed events so far, skipping challenge period filtering...') ||
        Promise.resolve(_state)
    : filterForExpiredProposalsAndPutThemInState(_state)
}

module.exports = {
  maybefilterForExpiredProposalsAndPutThemInState,
}
