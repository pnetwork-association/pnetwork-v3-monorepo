const R = require('ramda')
const schemas = require('ptokens-schemas')
const { ERROR_INVALID_NETWORK_ID } = require('./errors')

const checkEventHaveExpectedChainId = R.curry(
  (_reportChainIdKey, _expectedValue, _eventReport) =>
    new Promise((resolve, reject) => {
      const eventChainId = _eventReport[_reportChainIdKey]

      return eventChainId !== _expectedValue
        ? reject(
            new Error(
              `${ERROR_INVALID_NETWORK_ID} ${eventChainId} on report ${JSON.stringify(
                _eventReport
              )}, should be ${_expectedValue}`
            )
          )
        : resolve()
    })
)

const checkEventsHaveExpectedChainId = R.curry(
  (_reportChainIdKey, _expectedValue, _eventReports) =>
    Promise.all(
      _eventReports.map(
        checkEventHaveExpectedChainId(_reportChainIdKey, _expectedValue)
      )
    )
)

const checkEventsHaveExpectedDestinationChainId =
  checkEventsHaveExpectedChainId(
    schemas.constants.reportFields.SCHEMA_DESTINATION_NETWORK_ID_KEY
  )
const checkEventsHaveExpectedOriginChainId = checkEventsHaveExpectedChainId(
  schemas.constants.reportFields.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY
)

module.exports = {
  checkEventsHaveExpectedOriginChainId,
  checkEventsHaveExpectedDestinationChainId,
}
