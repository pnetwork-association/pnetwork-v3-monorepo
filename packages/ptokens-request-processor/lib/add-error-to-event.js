const R = require('ramda')
const constants = require('ptokens-constants')
const { logger } = require('./get-logger')

const addErrorToEvent = R.curry((_event, _err) => {
  const id = _event[constants.db.KEY_ID]
  logger.debug(`Adding error to ${id.slice(0, 20)}...`)
  const timestamp = new Date().toISOString()
  _event[constants.db.KEY_FINAL_TX_TS] = timestamp
  _event[constants.db.KEY_STATUS] = constants.db.txStatus.FAILED
  _event[constants.db.KEY_ERROR] = _err.toString()

  return Promise.resolve(_event)
})

module.exports = {
  addErrorToEvent,
}
