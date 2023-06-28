const {
  STATE_ONCHAIN_REQUESTS,
  STATE_FINALIZED_DB_REPORTS,
  STATE_DETECTED_DB_REPORTS,
  STATE_DISMISSED_DB_REPORTS,
  STATE_PROPOSED_DB_REPORTS,
  STATE_TO_BE_DISMISSED_REQUESTS,
} = require('./constants')
const R = require('ramda')

const addDetectedReportsToState = R.curry((_state, _detected) =>
  R.assoc(STATE_DETECTED_DB_REPORTS, _detected, _state)
)

const addProposalsReportsToState = R.curry((_state, _proposals) => {
  const proposedReports = _state[STATE_PROPOSED_DB_REPORTS]
  const allProposedTxs =
    proposedReports && proposedReports.length > 0
      ? R.concat(_proposals, proposedReports)
      : _proposals
  return R.assoc(STATE_PROPOSED_DB_REPORTS, allProposedTxs, _state)
})

const addDismissedReportsToState = R.curry((_state, _dismissals) =>
  R.assoc(STATE_DISMISSED_DB_REPORTS, _dismissals, _state)
)

const addFinalizedEventsToState = R.curry((_state, _finalTxs) =>
  R.assoc(STATE_FINALIZED_DB_REPORTS, _finalTxs, _state)
)

const removeKeyFromState = R.curry((_key, _state) => {
  delete _state[_key]
  return Promise.resolve(_state)
})

const removeOnChainRequestsFromState = removeKeyFromState(STATE_ONCHAIN_REQUESTS)

const removeDetectedEventsFromState = removeKeyFromState(STATE_DETECTED_DB_REPORTS)

const removeProposalsEventsFromState = removeKeyFromState(STATE_PROPOSED_DB_REPORTS)

const removeToBeDismissedEventsFromState = removeKeyFromState(STATE_TO_BE_DISMISSED_REQUESTS)

const removeFinalizedEventsFromState = removeKeyFromState(STATE_FINALIZED_DB_REPORTS)

const removeDismissedEventsFromState = removeKeyFromState(STATE_DISMISSED_DB_REPORTS)

module.exports = {
  addDetectedReportsToState,
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
