const {
  STATE_ONCHAIN_REQUESTS_KEY,
  STATE_FINALIZED_DB_REPORTS_KEY,
  STATE_DETECTED_DB_REPORTS_KEY,
  STATE_DISMISSED_DB_REPORTS_KEY,
  STATE_PROPOSED_DB_REPORTS_KEY,
  STATE_TO_BE_DISMISSED_REQUESTS_KEY,
} = require('./constants')
const { curry, assoc } = require('ramda')

const addProposalsReportsToState = curry((_state, _proposals) =>
  assoc(STATE_PROPOSED_DB_REPORTS_KEY, _proposals, _state)
)

const addDismissedReportsToState = curry((_state, _proposals) =>
  assoc(STATE_DISMISSED_DB_REPORTS_KEY, _proposals, _state)
)

const addFinalizedEventsToState = curry((_state, _finalTxs) =>
  assoc(STATE_FINALIZED_DB_REPORTS_KEY, _finalTxs, _state)
)

const removeKeyFromState = curry((_key, _state) => {
  delete _state[_key]
  return Promise.resolve(_state)
})

const removeOnChainRequestsFromState = removeKeyFromState(
  STATE_ONCHAIN_REQUESTS_KEY
)

const removeDetectedEventsFromState = removeKeyFromState(
  STATE_DETECTED_DB_REPORTS_KEY
)

const removeProposalsEventsFromState = removeKeyFromState(
  STATE_PROPOSED_DB_REPORTS_KEY
)

const removeToBeDismissedEventsFromState = removeKeyFromState(
  STATE_TO_BE_DISMISSED_REQUESTS_KEY
)

const removeFinalizedEventsFromState = removeKeyFromState(
  STATE_FINALIZED_DB_REPORTS_KEY
)

const removeDismissedEventsFromState = removeKeyFromState(
  STATE_DISMISSED_DB_REPORTS_KEY
)

module.exports = {
  addFinalizedEventsToState,
  addProposalsReportsToState,
  addDismissedReportsToState,
  removeDetectedEventsFromState,
  removeProposalsEventsFromState,
  removeFinalizedEventsFromState,
  removeDismissedEventsFromState,
  removeOnChainRequestsFromState,
  removeToBeDismissedEventsFromState,
}
