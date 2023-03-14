const schemas = require('ptokens-schemas')
const {
  getValidEventsWithStatusAndPutInState,
} = require('./get-valid-events-with-status')

const getDetectedEventsFromDbAndPutInState =
  getValidEventsWithStatusAndPutInState(schemas.db.enums.txStatus.DETECTED)

module.exports = {
  getDetectedEventsFromDbAndPutInState,
}
