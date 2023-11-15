const R = require('ramda')
const { db } = require('ptokens-utils')
module.exports.getActorFromStorage = R.curry((_actorsStorage, _actorAddress) =>
  db.findReportById(_actorsStorage, R.toLower(_actorAddress), {})
)
