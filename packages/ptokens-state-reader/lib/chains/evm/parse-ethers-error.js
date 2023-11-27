const R = require('ramda')
const ethers = require('ethers')
const { logger } = require('../../get-logger')
const { utils } = require('ptokens-utils')

module.exports.parseEthersErrorOrReject = R.curry((_hub, _err) =>
  Promise.resolve(R.prop('data', _err))
    .then(utils.rejectIfNil(_err))
    .then(_data => _hub.interface.parseError(_data))
    .then(_parsedError =>
      _parsedError instanceof ethers.ErrorDescription
        ? _parsedError
        : logger.debug('Unable to parse ethers error...') || Promise.reject(_err)
    )
)
