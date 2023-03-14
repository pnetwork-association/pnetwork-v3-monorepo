const schemas = require('ptokens-schemas')
const {
  getValidEventsWithStatusAndPutInState,
} = require('./get-valid-events-with-status')

const getProposedEventsFromDbAndPutInState =
  getValidEventsWithStatusAndPutInState(schemas.db.enums.txStatus.PROPOSED)

module.exports = {
  getProposedEventsFromDbAndPutInState,
}
