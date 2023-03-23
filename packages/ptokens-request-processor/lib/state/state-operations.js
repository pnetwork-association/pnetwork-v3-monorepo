const {
  STATE_FINALIZED_DB_REPORTS_KEY,
  STATE_DETECTED_DB_REPORTS_KEY,
  STATE_DISMISSED_DB_REPORTS_KEY,
  STATE_PROPOSED_DB_REPORTS_KEY,
} = require('./constants')
const { curry, assoc } = require('ramda')

const addProposalsReportsToState = curry((_state, _proposals) =>
  assoc(STATE_PROPOSED_DB_REPORTS_KEY, _proposals, _state)
)

const addDismissedReportsToState = curry((_state, _proposals) =>
  assoc(STATE_DISMISSED_DB_REPORTS_KEY, _proposals, _state)
)

const removeDetectedReportsFromState = _state => {
  delete _state[STATE_DETECTED_DB_REPORTS_KEY]
  return _state
}

const removeProposalsFromState = _state => {
  delete _state[STATE_DETECTED_DB_REPORTS_KEY]
  return _state
}

const addFinalizedEventsToState = curry((_state, _finalTxs) => {
  assoc(STATE_FINALIZED_DB_REPORTS_KEY, _finalTxs, _state)
})

const removeKeyFromState = curry((_key, _state) => {
  delete _state[_key]
  return Promise.resolve(_state)
})

const clearProposalsIntoState = removeKeyFromState(
  STATE_PROPOSED_DB_REPORTS_KEY
)

const clearDismissedEventsIntoState = removeKeyFromState(
  STATE_DISMISSED_DB_REPORTS_KEY
)

const clearFinalizedEventsInState = removeKeyFromState(
  STATE_FINALIZED_DB_REPORTS_KEY
)

module.exports = {
  clearProposalsIntoState,
  removeProposalsFromState,
  addFinalizedEventsToState,
  addProposalsReportsToState,
  addDismissedReportsToState,
  clearFinalizedEventsInState,
  clearDismissedEventsIntoState,
  removeDetectedReportsFromState,
}
