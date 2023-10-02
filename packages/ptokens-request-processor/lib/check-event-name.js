const R = require('ramda')
const errors = require('./errors')
const constants = require('ptokens-constants')

module.exports.checkEventName = _eventName =>
  R.includes(_eventName, R.values(constants.db.eventNames))
    ? Promise.resolve()
    : Promise.reject(new Error(`${errors.ERROR_INVALID_EVENT_NAME}: ${_eventName}`))
