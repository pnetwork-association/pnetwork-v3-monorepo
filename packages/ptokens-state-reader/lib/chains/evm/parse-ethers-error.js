const R = require('ramda')
const ethers = require('ethers')
const { logger } = require('../../get-logger')

module.exports.parseEthersErrorOrReject = R.curry((_hub, _err) =>
  Promise.resolve(_err)
    .then(R.prop('data'))
    .then(_data => _hub.interface.parseError(_data))
    .then(_parsedError =>
      _parsedError instanceof ethers.ErrorDescription
        ? _parsedError
        : logger.debug('Unable to parse ethers error...') || Promise.reject(_err)
    )
)
