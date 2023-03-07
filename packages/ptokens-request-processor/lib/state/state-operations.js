const {
  STATE_DETECTED_DB_REPORTS_KEY,
  STATE_PROPOSED_DB_REPORTS_KEY,
} = require('./constants')
const { curry, assoc } = require('ramda')

const addProposalsReportsToState = curry((_state, _proposals) =>
  assoc(STATE_PROPOSED_DB_REPORTS_KEY, _proposals, _state)
)
const removeDetectedReportsFromState = _state => {
  delete _state[STATE_DETECTED_DB_REPORTS_KEY]
  return _state
}

module.exports = {
  addProposalsReportsToState,
  removeDetectedReportsFromState,
}
