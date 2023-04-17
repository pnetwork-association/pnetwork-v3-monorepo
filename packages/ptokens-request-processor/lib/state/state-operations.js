const {
  STATE_ONCHAIN_REQUESTS_KEY,
  STATE_FINALIZED_DB_REPORTS_KEY,
  STATE_DETECTED_DB_REPORTS_KEY,
  STATE_DISMISSED_DB_REPORTS_KEY,
  STATE_PROPOSED_DB_REPORTS_KEY,
  STATE_TO_BE_DISMISSED_REQUESTS_KEY,
} = require('./constants')
const R = require('ramda')

const addProposalsReportsToState = R.curry((_state, _proposals) => {
  const proposedReports = _state[STATE_PROPOSED_DB_REPORTS_KEY]
  const allProposedTxs =
    proposedReports && proposedReports.length > 0
      ? R.concat(_proposals, proposedReports)
      : _proposals
  return R.assoc(STATE_PROPOSED_DB_REPORTS_KEY, allProposedTxs, _state)
})

const addDismissedReportsToState = R.curry((_state, _proposals) =>
  R.assoc(STATE_DISMISSED_DB_REPORTS_KEY, _proposals, _state)
)

const addFinalizedEventsToState = R.curry((_state, _finalTxs) =>
  R.assoc(STATE_FINALIZED_DB_REPORTS_KEY, _finalTxs, _state)
)

const removeKeyFromState = R.curry((_key, _state) => {
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
