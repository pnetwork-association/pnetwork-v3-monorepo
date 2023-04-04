const { curry } = require('ramda')
const schemas = require('ptokens-schemas')
const { ERROR_INVALID_CHAIN_ID } = require('./errors')

const checkEventHaveExpectedChainId = curry(
  (_reportChainIdKey, _expectedValue, _eventReport) =>
    new Promise((resolve, reject) => {
      const eventChainId = _eventReport[_reportChainIdKey]

      return eventChainId !== _expectedValue
        ? reject(
            new Error(
              `${ERROR_INVALID_CHAIN_ID} ${eventChainId} on report ${JSON.stringify(
                _eventReport
              )}, should be ${_expectedValue}`
            )
          )
        : resolve()
    })
)

const checkEventsHaveExpectedChainId = curry(
  (_reportChainIdKey, _expectedValue, _eventReports) =>
    Promise.all(
      _eventReports.map(
        checkEventHaveExpectedChainId(_reportChainIdKey, _expectedValue)
      )
    )
)

const checkEventsHaveExpectedDestinationChainId =
  checkEventsHaveExpectedChainId(
    schemas.constants.SCHEMA_DESTINATION_NETWORK_ID_KEY
  )
const checkEventsHaveExpectedOriginChainId = checkEventsHaveExpectedChainId(
  schemas.constants.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY
)

module.exports = {
  checkEventsHaveExpectedOriginChainId,
  checkEventsHaveExpectedDestinationChainId,
}
